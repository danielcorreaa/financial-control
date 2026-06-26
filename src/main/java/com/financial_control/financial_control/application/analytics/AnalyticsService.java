package com.financial_control.financial_control.application.analytics;

import com.financial_control.financial_control.application.analytics.dto.InstallmentDTO;
import com.financial_control.financial_control.application.analytics.dto.MonthCategoryTotals;
import com.financial_control.financial_control.application.invoice.dto.ParsedTransactionDTO;
import com.financial_control.financial_control.domain.card.CardInvoice;
import com.financial_control.financial_control.domain.card.CardInvoiceRepository;
import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.FinancialMonthRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Pattern INSTALLMENT = Pattern.compile("(\\d{1,2})/(\\d{1,2})");

    private static final Map<Integer, String> MONTH_NAMES = Map.ofEntries(
            Map.entry(1, "Jan"), Map.entry(2, "Fev"), Map.entry(3, "Mar"),
            Map.entry(4, "Abr"), Map.entry(5, "Mai"), Map.entry(6, "Jun"),
            Map.entry(7, "Jul"), Map.entry(8, "Ago"), Map.entry(9, "Set"),
            Map.entry(10, "Out"), Map.entry(11, "Nov"), Map.entry(12, "Dez")
    );

    private final FinancialMonthRepository monthRepository;
    private final CardInvoiceRepository cardInvoiceRepository;

    public AnalyticsService(FinancialMonthRepository monthRepository,
                            CardInvoiceRepository cardInvoiceRepository) {
        this.monthRepository = monthRepository;
        this.cardInvoiceRepository = cardInvoiceRepository;
    }

    public List<MonthCategoryTotals> getCategoryTotals(int year) {
        List<FinancialMonth> months = monthRepository.findByYear(year);
        return months.stream()
                .sorted(Comparator.comparingInt(m -> m.getMonth().getValue()))
                .map(m -> {
                    Map<ExpenseCategory, Double> totals = m.getExpenses().stream()
                            .collect(Collectors.groupingBy(
                                    Expense::getCategory,
                                    Collectors.summingDouble(e -> e.getAmount().doubleValue())
                            ));
                    double grand = totals.values().stream().mapToDouble(Double::doubleValue).sum();
                    return new MonthCategoryTotals(
                            m.getMonth().getValue(), m.getYear(),
                            MONTH_NAMES.getOrDefault(m.getMonth().getValue(), ""),
                            totals, grand
                    );
                })
                .toList();
    }

    public List<InstallmentDTO> getActiveInstallments() {
        YearMonth now = YearMonth.now();
        List<InstallmentDTO> result = new ArrayList<>();

        // Parcelas detectadas nos nomes de despesas manuais
        for (FinancialMonth m : monthRepository.findAll()) {
            for (Expense e : m.getExpenses()) {
                Matcher matcher = INSTALLMENT.matcher(e.getName());
                if (!matcher.find()) continue;

                int current = Integer.parseInt(matcher.group(1));
                int total   = Integer.parseInt(matcher.group(2));
                if (current >= total) continue;

                LocalDate due     = e.getDueDate();
                LocalDate endDate = due != null ? due.plusMonths(total - current) : null;
                if (endDate != null && YearMonth.from(endDate).isBefore(now)) continue;

                String cleanName = e.getName().replaceAll("\\s*\\d{1,2}/\\d{1,2}\\s*$", "").trim();
                result.add(new InstallmentDTO(
                        e.getId(), m.getId(), cleanName,
                        e.getAmount().doubleValue(),
                        current, total, total - current,
                        due, endDate
                ));
            }
        }

        // Parcelas detectadas nos lançamentos de faturas PDF (Bradesco)
        // Agrupa por (nome, total) e mantém apenas o registro mais recente (maior current)
        // para evitar duplicatas quando o mesmo item aparece em vários PDFs importados.
        Map<String, InstallmentDTO> fromPdf = new LinkedHashMap<>();

        for (CardInvoice invoice : cardInvoiceRepository.findAll()) {
            if (invoice.getTransactions() == null) continue;

            for (ParsedTransactionDTO tx : invoice.getTransactions()) {
                Matcher matcher = INSTALLMENT.matcher(tx.description());
                if (!matcher.find()) continue;

                int current = Integer.parseInt(matcher.group(1));
                int total   = Integer.parseInt(matcher.group(2));
                if (current >= total) continue;

                LocalDate due     = invoice.getDueDate();
                LocalDate endDate = due != null ? due.plusMonths(total - current) : null;
                if (endDate != null && YearMonth.from(endDate).isBefore(now)) continue;

                String cleanName = tx.description().replaceAll("\\s*\\d{1,2}/\\d{1,2}\\s*$", "").trim();
                String key       = cleanName + "|" + total;

                InstallmentDTO existing = fromPdf.get(key);
                if (existing == null || current > existing.current()) {
                    fromPdf.put(key, new InstallmentDTO(
                            invoice.getExpenseId(), invoice.getMonthId(), cleanName,
                            tx.amount(), current, total, total - current,
                            due, endDate
                    ));
                }
            }
        }

        result.addAll(fromPdf.values());
        result.sort(Comparator.comparing(i -> i.endDate() != null ? i.endDate() : LocalDate.MAX));
        return result;
    }
}
