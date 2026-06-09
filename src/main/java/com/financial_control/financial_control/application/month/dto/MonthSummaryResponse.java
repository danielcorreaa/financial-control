package com.financial_control.financial_control.application.month.dto;

import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.MonthStatus;

import java.math.BigDecimal;

/**
 * DTO de resumo financeiro (balanço) de um mês.
 */
public record MonthSummaryResponse(
        String id,
        int month,
        int year,
        String monthName,
        MonthStatus status,
        BigDecimal totalIncomes,
        BigDecimal totalExpenses,
        BigDecimal totalPaid,
        BigDecimal totalPending,
        BigDecimal balance
) {
    public static MonthSummaryResponse from(FinancialMonth month) {
        return new MonthSummaryResponse(
                month.getId(),
                month.getMonth().getValue(),
                month.getYear(),
                month.getMonth().name(),
                month.getStatus(),
                month.getTotalIncomes(),
                month.getTotalExpenses(),
                month.getTotalPaid(),
                month.getTotalPending(),
                month.getBalance()
        );
    }
}
