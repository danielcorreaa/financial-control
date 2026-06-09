package com.financial_control.financial_control.application.project.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Comando para adição de uma despesa a um projeto financeiro.
 * debitMonth + debitYear: mês/ano onde lançar como despesa
 * debitSource: fonte especial (PLR, DECIMO_TERCEIRO, SALARIO) — usado para buscar o mês automaticamente
 */
public record CreateProjectExpenseCommand(

        @NotBlank(message = "A descrição é obrigatória")
        String description,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "O valor deve ser maior que zero")
        BigDecimal amount,

        String notes,

        // vínculo de débito (pelo menos um dos dois deve ser informado para lançar)
        Integer debitMonth,
        Integer debitYear,
        String debitSource   // "PLR", "DECIMO_TERCEIRO", "SALARIO", ou null
) {}
