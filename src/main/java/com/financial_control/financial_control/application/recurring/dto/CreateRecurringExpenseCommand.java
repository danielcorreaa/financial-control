package com.financial_control.financial_control.application.recurring.dto;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateRecurringExpenseCommand(
        @NotBlank String name,
        @NotNull ExpenseCategory category,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        Integer dayOfMonth
) {}
