package com.financial_control.financial_control.application.analytics.dto;

import java.time.LocalDate;

public record InstallmentDTO(
        String expenseId,
        String monthId,
        String name,
        double monthlyAmount,
        int current,
        int total,
        int remaining,
        LocalDate currentDueDate,
        LocalDate endDate
) {}
