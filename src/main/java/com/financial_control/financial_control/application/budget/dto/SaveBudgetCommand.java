package com.financial_control.financial_control.application.budget.dto;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Map;

public record SaveBudgetCommand(
        @NotNull Map<ExpenseCategory, BigDecimal> limits
) {}
