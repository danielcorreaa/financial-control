package com.financial_control.financial_control.application.budget.dto;

import com.financial_control.financial_control.domain.budget.CategoryBudget;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;

import java.math.BigDecimal;
import java.util.Map;

public record BudgetResponse(
        String id,
        int year,
        Map<ExpenseCategory, BigDecimal> limits
) {
    public static BudgetResponse from(CategoryBudget domain) {
        return new BudgetResponse(domain.getId(), domain.getYear(), domain.getLimits());
    }
}
