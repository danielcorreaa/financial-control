package com.financial_control.financial_control.application.month.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Comando para criação de um mês financeiro.
 */
public record CreateMonthCommand(

        @NotNull(message = "O mês é obrigatório")
        @Min(value = 1, message = "O mês deve ser entre 1 e 12")
        @Max(value = 12, message = "O mês deve ser entre 1 e 12")
        Integer month,

        @NotNull(message = "O ano é obrigatório")
        @Min(value = 2000, message = "O ano deve ser a partir de 2000")
        Integer year,

        String notes
) {}
