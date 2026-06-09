package com.financial_control.financial_control.application.expense.dto;

import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.expense.ExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de resposta de uma despesa.
 */
public record ExpenseResponse(
        String id,
        String name,
        ExpenseCategory category,
        BigDecimal amount,
        ExpenseStatus status,
        LocalDate dueDate,
        LocalDate paymentDate,
        String notes
) {
    public static ExpenseResponse from(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getName(),
                expense.getCategory(),
                expense.getAmount(),
                expense.getStatus(),
                expense.getDueDate(),
                expense.getPaymentDate(),
                expense.getNotes()
        );
    }
}
