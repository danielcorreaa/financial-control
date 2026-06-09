package com.financial_control.financial_control.application.project.dto;

import com.financial_control.financial_control.domain.project.ProjectExpense;

import java.math.BigDecimal;

public record ProjectExpenseResponse(
        String id,
        String description,
        BigDecimal amount,
        boolean paid,
        String notes,
        Integer debitMonth,
        Integer debitYear,
        String debitSource,
        boolean launched,
        String launchedExpenseId,
        String launchedMonthId
) {
    public static ProjectExpenseResponse from(ProjectExpense e) {
        return new ProjectExpenseResponse(
                e.getId(), e.getDescription(), e.getAmount(), e.isPaid(), e.getNotes(),
                e.getDebitMonth(), e.getDebitYear(), e.getDebitSource(),
                e.isLaunched(), e.getLaunchedExpenseId(), e.getLaunchedMonthId()
        );
    }
}
