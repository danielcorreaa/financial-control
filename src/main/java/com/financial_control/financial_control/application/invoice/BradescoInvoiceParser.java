package com.financial_control.financial_control.application.invoice;

import com.financial_control.financial_control.application.invoice.dto.InvoiceParseResult;
import com.financial_control.financial_control.application.invoice.dto.ParsedTransactionDTO;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BradescoInvoiceParser {

    // DD/MM at start, then description, then BRL amount at end (optional trailing -)
    private static final Pattern TX_LINE = Pattern.compile(
            "^(\\d{2}/\\d{2})\\s+(.+)\\s+(\\d{1,3}(?:\\.\\d{3})*,\\d{2})\\s*(-?)\\s*$"
    );

    // Finds DD/MM/YYYY anywhere in text
    private static final Pattern FULL_DATE = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})");

    public InvoiceParseResult parse(MultipartFile file) throws IOException {
        String text;
        try (PDDocument doc = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            text = stripper.getText(doc);
        }
        return parseText(text);
    }

    private InvoiceParseResult parseText(String text) {
        String[] lines = text.split("\\r?\\n");

        String invoiceDueDate = detectDueDate(lines);

        List<ParsedTransactionDTO> transactions = new ArrayList<>();
        boolean inSection = false;

        for (String raw : lines) {
            String line = raw.trim();

            // Start collecting after the "Lançamentos" header
            if (line.contains("ан") || line.equals("Lançamentos") || line.equals("Lancamentos")) {
                inSection = true;
                continue;
            }
            // Stop at totals
            if (line.startsWith("Total para") || line.startsWith("Total da fatura")) {
                inSection = false;
                continue;
            }
            if (!inSection) continue;

            Matcher m = TX_LINE.matcher(line);
            if (!m.matches()) continue;

            String date        = m.group(1);
            String description = m.group(2).trim();
            String amountStr   = m.group(3);
            boolean isCredit   = "-".equals(m.group(4).trim());

            if (isCredit) continue;
            String descUpper = description.toUpperCase();
            if (descUpper.contains("PAGTO") || descUpper.contains("PAGAMENTO") ||
                descUpper.contains("PAG. DEB") || descUpper.contains("DEB EM C")) continue;

            double amount = parseAmount(amountStr);
            if (amount <= 0) continue;

            transactions.add(new ParsedTransactionDTO(
                    date, description, amount, guessCategory(description)
            ));
        }

        return new InvoiceParseResult(invoiceDueDate, transactions);
    }

    private String detectDueDate(String[] lines) {
        boolean nextLineIsDate = false;
        for (String raw : lines) {
            String line = raw.trim();
            Matcher m = FULL_DATE.matcher(line);
            if (nextLineIsDate && m.find()) {
                return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
            }
            if (line.contains("Vencimento")) {
                nextLineIsDate = true;
                // date might be on same line
                if (m.find()) {
                    return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
                }
            } else {
                nextLineIsDate = false;
            }
        }
        return null;
    }

    private double parseAmount(String s) {
        try {
            return Double.parseDouble(s.replace(".", "").replace(",", "."));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private ExpenseCategory guessCategory(String description) {
        String d = description.toLowerCase();

        // Transport
        if (d.contains("uber") || d.contains("99app") || d.contains("cabify") ||
            d.contains("taxi") || d.contains("estacionamento") || d.contains("pedagio") ||
            d.contains("shell") || d.contains("ipiranga") || d.contains("petrobras") ||
            d.contains("combustivel") || d.contains("gasolina") || d.contains("auto posto") ||
            d.contains("dl *uber") || d.contains("dl *99")) {
            return ExpenseCategory.TRANSPORTE;
        }

        // Food & Delivery
        if (d.contains("ifood") || d.contains("ifd*") || d.contains("restaurante") ||
            d.contains("lanchonete") || d.contains("padaria") || d.contains("pizza") ||
            d.contains("churrascaria") || d.contains("sushi") || d.contains("supermer") ||
            d.contains("mercado") || d.contains("hortifruti") || d.contains("acougue") ||
            d.contains("deli") || d.contains("sanduich") || d.contains("market") ||
            d.contains("atacadao") || d.contains("carrefour") || d.contains("extra ") ||
            d.contains("sonda") || d.contains("hiper") || d.contains("lrc") ||
            d.contains("cafe") || d.contains("lancheria") || d.contains("pastelaria") ||
            d.contains("burguer") || d.contains("mc ") || d.contains("kg ")) {
            return ExpenseCategory.ALIMENTACAO;
        }

        // Entertainment / Leisure
        if (d.contains("airbnb") || d.contains("cinema") || d.contains("cinemark") ||
            d.contains("teatro") || d.contains("danceteria") || d.contains("netflix") ||
            d.contains("spotify") || d.contains("disney") || d.contains("hbo") ||
            d.contains("hotel") || d.contains("pousada") || d.contains("viagem") ||
            d.contains("booking") || d.contains("loteria") || d.contains("loterico") ||
            d.contains("balada") || d.contains("bar ") || d.contains("show ")) {
            return ExpenseCategory.LAZER;
        }

        // Education
        if (d.contains("alura") || d.contains("udemy") || d.contains("coursera") ||
            d.contains("escola") || d.contains("faculdade") || d.contains("jusbrasil") ||
            d.contains("descomplica") || d.contains("duolingo") || d.contains("curso ") ||
            d.contains("educacao") || d.contains("ensino") || d.contains("colegio")) {
            return ExpenseCategory.EDUCACAO;
        }

        // Internet / Telecom
        if (d.contains("claro") || d.contains("vivo ") || d.contains("tim ") ||
            d.contains("oi ") || d.contains("nextel") || d.contains("net ") ||
            d.contains("telefonica") || d.contains("internet") || d.contains("fibra")) {
            return ExpenseCategory.INTERNET;
        }

        // Housing
        if (d.contains("aluguel") || d.contains("condominio") || d.contains("energia ") ||
            d.contains("eletrica") || d.contains("enel") || d.contains("cemig") ||
            d.contains("celpe") || d.contains("sabesp") || d.contains("copasa") ||
            d.contains("agua ") || d.contains("gas ")) {
            return ExpenseCategory.MORADIA;
        }

        // Taxes
        if (d.contains("imposto") || d.contains("detran") || d.contains("ipva") ||
            d.contains("iptu") || d.contains("receita federal") || d.contains("tributo")) {
            return ExpenseCategory.IMPOSTOS;
        }

        return ExpenseCategory.OUTROS;
    }
}
