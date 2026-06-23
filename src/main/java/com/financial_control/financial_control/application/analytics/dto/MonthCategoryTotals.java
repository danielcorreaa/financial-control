package com.financial_control.financial_control.application.analytics.dto;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;

import java.util.Map;

public record MonthCategoryTotals(
        int month,
        int year,
        String monthName,
        Map<ExpenseCategory, Double> totals,
        double grandTotal
) {}
