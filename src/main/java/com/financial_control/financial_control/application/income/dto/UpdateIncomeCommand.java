package com.financial_control.financial_control.application.income.dto;

import com.financial_control.financial_control.domain.income.IncomeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Comando para atualização de uma receita existente.
 */
public record UpdateIncomeCommand(

        @NotBlank(message = "A descrição da receita é obrigatória")
        String description,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "O valor deve ser maior que zero")
        BigDecimal amount,

        @NotNull(message = "O tipo de receita é obrigatório")
        IncomeType type,

        LocalDate date,

        String notes
) {}
