package com.financial_control.financial_control.application.project.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

/**
 * Comando para criação de um projeto financeiro extraordinário.
 */
public record CreateProjectCommand(

        @NotBlank(message = "O nome do projeto é obrigatório")
        String name,

        String description,

        LocalDate startDate,

        LocalDate endDate
) {}
