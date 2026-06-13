package com.financial_control.financial_control.application.recurring.dto;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.recurring.RecurringExpense;

import java.math.BigDecimal;

public record RecurringExpenseResponse(
        String id,
        String name,
        ExpenseCategory category,
        BigDecimal amount,
        Integer dayOfMonth,
        boolean active
) {
    public static RecurringExpenseResponse from(RecurringExpense domain) {
        return new RecurringExpenseResponse(
                domain.getId(),
                domain.getName(),
                domain.getCategory(),
                domain.getAmount(),
                domain.getDayOfMonth(),
                domain.isActive()
        );
    }
}
