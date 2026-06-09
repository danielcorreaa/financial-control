package com.financial_control.financial_control.application.salary.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record SaveSalaryConfigCommand(

        @NotNull @Min(2000)
        Integer year,

        @NotNull
        BigDecimal grossSalary,

        boolean manualInss,
        BigDecimal manualInssValue,

        int dependents,

        List<SalaryDiscountDto> discounts,

        BigDecimal plr,
        BigDecimal thirteenthSalary,
        String notes
) {}
