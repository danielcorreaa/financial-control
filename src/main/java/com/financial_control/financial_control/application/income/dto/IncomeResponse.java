package com.financial_control.financial_control.application.income.dto;

import com.financial_control.financial_control.domain.income.Income;
import com.financial_control.financial_control.domain.income.IncomeType;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de resposta de uma receita.
 */
public record IncomeResponse(
        String id,
        String description,
        BigDecimal amount,
        IncomeType type,
        LocalDate date,
        String notes
) {
    public static IncomeResponse from(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getDescription(),
                income.getAmount(),
                income.getType(),
                income.getDate(),
                income.getNotes()
        );
    }
}
