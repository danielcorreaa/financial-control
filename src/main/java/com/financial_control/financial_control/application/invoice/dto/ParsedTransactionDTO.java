package com.financial_control.financial_control.application.invoice.dto;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;

public record ParsedTransactionDTO(
        String originalDate,
        String description,
        double amount,
        ExpenseCategory suggestedCategory
) {}
