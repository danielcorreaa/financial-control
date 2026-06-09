package com.financial_control.financial_control.application.dashboard;

import com.financial_control.financial_control.application.month.dto.MonthSummaryResponse;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.FinancialMonthRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * Serviço de aplicação para geração do dashboard financeiro consolidado.
 */
@Service
public class DashboardService {

    private final FinancialMonthRepository repository;

    public DashboardService(FinancialMonthRepository repository) {
        this.repository = repository;
    }

    /**
     * Retorna o dashboard do ano corrente com saldo acumulado de todos os meses.
     */
    public DashboardResponse getDashboard(int year) {
        List<FinancialMonth> months = repository.findByYear(year).stream()
                .sorted(Comparator.comparingInt(m -> m.getMonth().getValue()))
                .toList();

        BigDecimal totalIncomes = months.stream()
                .map(FinancialMonth::getTotalIncomes)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = months.stream()
                .map(FinancialMonth::getTotalExpenses)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal annualBalance = totalIncomes.subtract(totalExpenses);

        // Saldo acumulado: soma de todos os saldos mensais de anos anteriores + ano atual
        List<FinancialMonth> allMonths = repository.findAll();
        BigDecimal accumulatedBalance = allMonths.stream()
                .map(FinancialMonth::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthSummaryResponse> summaries = months.stream()
                .map(MonthSummaryResponse::from)
                .toList();

        return new DashboardResponse(year, totalIncomes, totalExpenses,
                annualBalance, accumulatedBalance, summaries);
    }
}
