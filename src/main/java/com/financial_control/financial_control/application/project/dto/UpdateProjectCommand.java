package com.financial_control.financial_control.application.project.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

/**
 * Comando para atualização de um projeto financeiro.
 */
public record UpdateProjectCommand(

        @NotBlank(message = "O nome do projeto é obrigatório")
        String name,

        String description,

        LocalDate startDate,

        LocalDate endDate
) {}
