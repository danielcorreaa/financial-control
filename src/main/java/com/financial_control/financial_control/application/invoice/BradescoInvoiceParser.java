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

    // Linha de transação: DD/MM <descrição com possível parcela X/Y> <CIDADE> <R$>
    // Limita o comprimento da linha para evitar mistura com coluna direita do PDF
    private static final Pattern TX_LINE = Pattern.compile(
            "^(\\d{2}/\\d{2})\\s+(.{3,80})\\s+(\\d{1,3}(?:\\.\\d{3})*,\\d{2})\\s*(-?)\\s*$"
    );

    // Data completa DD/MM/YYYY
    private static final Pattern FULL_DATE = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})");

    // Total oficial da fatura (rodapé da última página)
    // Ex: "Total da fatura em real 3.316,94" ou "Total para DANIEL ... 3.316,94"
    private static final Pattern TOTAL_FATURA = Pattern.compile(
            "Total(?:\\s+da\\s+fatura\\s+em\\s+real|\\s+para\\s+[A-Z][A-Z\\s]+)\\s+(\\d{1,3}(?:\\.\\d{3})*,\\d{2})"
    );

    // Linhas a ignorar mesmo que comecem com DD/MM
    private static final Pattern SKIP_PATTERN = Pattern.compile(
            "PAGTO|PAGAMENTO|ESTORNO|DEB EM C|PAG\\s*\\.?\\s+POR"
    );

    public InvoiceParseResult parse(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        String text;
        try (PDDocument doc = PDDocument.load(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            // NOT sorting by position avoids mixing left/right column text
            stripper.setSortByPosition(false);
            text = stripper.getText(doc);
        } catch (Exception e) {
            throw new IOException("Nao foi possivel ler o PDF: " + e.getMessage(), e);
        }
        return parseText(text);
    }

    InvoiceParseResult parseText(String text) {
        String[] lines = text.split("\\r?\\n");

        String invoiceDueDate = detectDueDate(lines);
        Double invoiceTotal = detectOfficialTotal(lines);
        List<ParsedTransactionDTO> transactions = extractTransactions(lines);

        return new InvoiceParseResult(invoiceDueDate, invoiceTotal, transactions);
    }

    private Double detectOfficialTotal(String[] lines) {
        // Look for "Total da fatura em real X" or "Total para NAME X" (last page)
        for (String raw : lines) {
            String line = raw.trim();
            Matcher m = TOTAL_FATURA.matcher(line);
            if (m.find()) {
                return parseAmount(m.group(1));
            }
        }
        // Fallback: look for "(=)Total ... X" in the summary section
        for (String raw : lines) {
            String line = raw.trim();
            if (line.startsWith("(=)Total") || line.startsWith("(=) Total")) {
                Matcher m = Pattern.compile("(\\d{1,3}(?:\\.\\d{3})*,\\d{2})").matcher(line);
                if (m.find()) {
                    return parseAmount(m.group(1));
                }
            }
        }
        return null;
    }

    // Separa a cidade (palavras em MAIÚSCULAS no final) da descrição
    private static final Pattern CITY_SUFFIX = Pattern.compile(
            "\\s+([A-Z]{2,}(?:\\s+[A-Z]{2,})*)\\s*$"
    );

    private List<ParsedTransactionDTO> extractTransactions(String[] lines) {
        List<ParsedTransactionDTO> result = new ArrayList<>();

        for (String raw : lines) {
            String line = raw.trim();
            if (line.isEmpty()) continue;

            Matcher m = TX_LINE.matcher(line);
            if (!m.matches()) continue;

            String date      = m.group(1);
            String rawDesc   = m.group(2).trim();
            String amountStr = m.group(3);
            boolean isCredit = "-".equals(m.group(4).trim());

            if (isCredit) continue;

            if (SKIP_PATTERN.matcher(rawDesc.toUpperCase()).find()) continue;
            if (rawDesc.toUpperCase().startsWith("TOTAL")) continue;

            double amount = parseAmount(amountStr);
            if (amount <= 0 || amount >= 5_000) continue;

            String[] parts      = splitDescriptionCity(rawDesc);
            String description  = parts[0];
            String city         = parts[1];

            result.add(new ParsedTransactionDTO(
                    date, description, city, amount, guessCategory(rawDesc)
            ));
        }

        return result;
    }

    // Retorna [descrição limpa, cidade ou null]
    private String[] splitDescriptionCity(String raw) {
        Matcher cm = CITY_SUFFIX.matcher(raw);
        if (cm.find()) {
            String desc = raw.substring(0, cm.start()).trim();
            String city = cm.group(1).trim();
            return new String[]{ desc.isEmpty() ? raw : desc, city };
        }
        return new String[]{ raw, null };
    }

    private String detectDueDate(String[] lines) {
        boolean nextIsDate = false;
        for (String raw : lines) {
            String line = raw.trim();

            if (line.contains("Vencimento")) {
                Matcher m = FULL_DATE.matcher(line);
                if (m.find()) {
                    return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
                }
                nextIsDate = true;
                continue;
            }

            if (nextIsDate && !line.isEmpty()) {
                Matcher m = FULL_DATE.matcher(line);
                if (m.find()) {
                    return m.group(3) + "-" + m.group(2) + "-" + m.group(1);
                }
                nextIsDate = false;
            }
        }

        // Fallback: first DD/MM/YYYY found
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
                "shell", "ipiranga", "petrobras", "combustivel", "gasolina", "auto posto",
                "bus servicos", "clickbus", "rodo stop")) {
            return ExpenseCategory.TRANSPORTE;
        }

        if (matches(d, "ifood", "ifd*", "restaurante", "lanchonete", "padaria", "pizza",
                "churrascaria", "sushi", "supermer", "mercado", "hortifruti", "acougue",
                "deli", "sanduich", "market", "atacadao", "carrefour", "extra ",
                "hiper", "lrc", "cafe", "lancheria", "burguer", "mc ", "casa hirata",
                "supermercados avenida", "lanches")) {
            return ExpenseCategory.ALIMENTACAO;
        }

        if (matches(d, "airbnb", "cinema", "cinemark", "teatro", "netflix",
                "spotify", "disney", "hbo", "hotel", "pousada", "viagem", "booking",
                "loteria", "loterico", "balada", "bar ", "show ", "ingresso",
                "nintendo", "playstation", "sony", "steam", "oldflix", "mobifacil")) {
            return ExpenseCategory.LAZER;
        }

        if (matches(d, "alura", "udemy", "coursera", "escola", "faculdade",
                "descomplica", "duolingo", "curso ", "livro", "livraria",
                "dpaschoal", "lins comercio de liv")) {
            return ExpenseCategory.EDUCACAO;
        }

        if (matches(d, "claro", "vivo ", "tim ", "oi ", "nextel", "net ", "telefonica",
                "internet", "fibra", "vindi ")) {
            return ExpenseCategory.INTERNET;
        }

        if (matches(d, "aluguel", "condominio", "energia ", "eletrica", "enel", "cemig",
                "celpe", "sabesp", "copasa", "agua ", "gas ", "anjos colchoes")) {
            return ExpenseCategory.MORADIA;
        }

        if (matches(d, "imposto", "detran", "ipva", "iptu", "receita federal")) {
            return ExpenseCategory.IMPOSTOS;
        }

        if (matches(d, "odontologia", "farmacia", "drogaria", "hospital", "clinica",
                "medico", "exame", "laboratorio", "saude")) {
            return ExpenseCategory.SAUDE;
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
