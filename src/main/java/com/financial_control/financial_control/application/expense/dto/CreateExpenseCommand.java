package com.financial_control.financial_control.application.expense.dto;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Comando para adição de uma despesa a um mês financeiro.
 */
public record CreateExpenseCommand(

        @NotBlank(message = "O nome da despesa é obrigatório")
        String name,

        @NotNull(message = "A categoria é obrigatória")
        ExpenseCategory category,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "O valor deve ser maior que zero")
        BigDecimal amount,

        LocalDate dueDate,

        String notes
) {}
