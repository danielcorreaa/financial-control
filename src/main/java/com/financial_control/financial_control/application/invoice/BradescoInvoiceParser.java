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

    // Linha de transação: DD/MM <descrição> <valor BRL> ["-"]
    // O ".+" greedy faz backtrack para pegar o ÚLTIMO valor no final
    private static final Pattern TX_LINE = Pattern.compile(
            "^(\\d{2}/\\d{2})\\s+(.+)\\s+(\\d{1,3}(?:\\.\\d{3})*,\\d{2})\\s*(-?)\\s*$"
    );

    // Data completa DD/MM/YYYY (para vencimento)
    private static final Pattern FULL_DATE = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})");

    // Linhas a ignorar mesmo que comecem com DD/MM
    private static final Pattern SKIP_PATTERN = Pattern.compile(
            "PAGTO|PAGAMENTO|ESTORNO|DEB EM C|PAGTO\\.|PAG\\."
    );

    public InvoiceParseResult parse(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        String text;
        try (PDDocument doc = PDDocument.load(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            text = stripper.getText(doc);
        } catch (Exception e) {
            throw new IOException("Nao foi possivel ler o PDF: " + e.getMessage(), e);
        }
        return parseText(text);
    }

    private InvoiceParseResult parseText(String text) {
        String[] lines = text.split("\\r?\\n");

        String invoiceDueDate = detectDueDate(lines);
        List<ParsedTransactionDTO> transactions = extractTransactions(lines);

        return new InvoiceParseResult(invoiceDueDate, transactions);
    }

    private List<ParsedTransactionDTO> extractTransactions(String[] lines) {
        List<ParsedTransactionDTO> result = new ArrayList<>();

        // Busca transações em qualquer parte do PDF — não depende de detectar a seção
        for (String raw : lines) {
            String line = raw.trim();
            if (line.isEmpty()) continue;

            Matcher m = TX_LINE.matcher(line);
            if (!m.matches()) continue;

            String date        = m.group(1);
            String description = m.group(2).trim();
            String amountStr   = m.group(3);
            boolean isCredit   = "-".equals(m.group(4).trim());

            if (isCredit) continue;

            // Pula linhas de pagamento, estorno, cabeçalho
            if (SKIP_PATTERN.matcher(description.toUpperCase()).find()) continue;

            // Pula totalizadores
            if (description.toUpperCase().startsWith("TOTAL")) continue;

            // Pula linhas com valores muito altos que são totalização da fatura
            double amount = parseAmount(amountStr);
            if (amount <= 0 || amount >= 10_000) continue;

            result.add(new ParsedTransactionDTO(
                    date, cleanDescription(description), amount, guessCategory(description)
            ));
        }

        return result;
    }

    /**
     * Remove parcela info do tipo "11/12" ou "03/07" do final da descrição,
     * e remove o nome da cidade em maiúsculas que aparece no final.
     */
    private String cleanDescription(String desc) {
        // Remove trailing city name pattern (tudo maiúsculo no final)
        String cleaned = desc.replaceAll("\\s+[A-Z]{2,}(?:\\s+[A-Z]{2,})*\\s*$", "").trim();
        // Remove parcel notation like " 11/12" or " 03/07"
        cleaned = cleaned.replaceAll("\\s+\\d{2}/\\d{2}\\s*$", "").trim();
        return cleaned.isEmpty() ? desc : cleaned;
    }

    private String detectDueDate(String[] lines) {
        boolean nextIsDate = false;
        for (String raw : lines) {
            String line = raw.trim();

            if (nextIsDate) {
                Matcher m = FULL_DATE.matcher(line);
                if (m.find()) {
                    return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
                }
                // Keep looking for 2 more lines
            }

            if (line.contains("Vencimento")) {
                // Try same line first
                Matcher m = FULL_DATE.matcher(line);
                if (m.find()) {
                    return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
                }
                nextIsDate = true;
            } else if (!line.isEmpty()) {
                // Only reset if we see a non-empty line that's not the date
                if (nextIsDate) {
                    Matcher m = FULL_DATE.matcher(line);
                    if (m.find()) {
                        return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
                    }
                    nextIsDate = false;
                }
            }
        }

        // Fallback: find any DD/MM/YYYY in the document
        for (String raw : lines) {
            Matcher m = FULL_DATE.matcher(raw);
            if (m.find()) {
                String year = m.group(3);
                if (year.startsWith("20")) {
                    return year + "-" + m.group(2) + "-" + m.group(1);
                }
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

        if (matches(d, "uber", "99app", "cabify", "taxi", "estacionamento", "pedagio",
                "shell", "ipiranga", "petrobras", "combustivel", "gasolina", "auto posto")) {
            return ExpenseCategory.TRANSPORTE;
        }

        if (matches(d, "ifood", "ifd*", "restaurante", "lanchonete", "padaria", "pizza",
                "churrascaria", "sushi", "supermer", "mercado", "hortifruti", "acougue",
                "deli", "sanduich", "market", "atacadao", "carrefour", "extra ",
                "sonda", "hiper", "lrc", "cafe", "lancheria", "kg ", "burguer", "mc ")) {
            return ExpenseCategory.ALIMENTACAO;
        }

        if (matches(d, "airbnb", "cinema", "cinemark", "teatro", "danceteria", "netflix",
                "spotify", "disney", "hbo", "hotel", "pousada", "viagem", "booking",
                "loteria", "loterico", "balada", "bar ", "show ", "ingresso")) {
            return ExpenseCategory.LAZER;
        }

        if (matches(d, "alura", "udemy", "coursera", "escola", "faculdade", "jusbrasil",
                "descomplica", "duolingo", "curso ", "educacao", "ensino", "colegio")) {
            return ExpenseCategory.EDUCACAO;
        }

        if (matches(d, "claro", "vivo ", "tim ", "oi ", "nextel", "net ", "telefonica",
                "internet", "fibra")) {
            return ExpenseCategory.INTERNET;
        }

        if (matches(d, "aluguel", "condominio", "energia ", "eletrica", "enel", "cemig",
                "celpe", "sabesp", "copasa", "agua ", "gas ")) {
            return ExpenseCategory.MORADIA;
        }

        if (matches(d, "imposto", "detran", "ipva", "iptu", "receita federal", "tributo")) {
            return ExpenseCategory.IMPOSTOS;
        }

        return ExpenseCategory.OUTROS;
    }

    private boolean matches(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
