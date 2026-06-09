package com.financial_control.financial_control.application.salary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SalaryDiscountDto(
        @NotBlank String label,
        @NotNull BigDecimal amount
) {}
