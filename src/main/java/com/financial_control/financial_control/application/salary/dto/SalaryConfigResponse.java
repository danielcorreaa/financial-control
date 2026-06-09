package com.financial_control.financial_control.application.salary.dto;

import com.financial_control.financial_control.domain.salary.SalaryConfig;

import java.math.BigDecimal;
import java.util.List;

public record SalaryConfigResponse(
        String id,
        int year,
        BigDecimal grossSalary,
        boolean manualInss,
        BigDecimal manualInssValue,
        int dependents,
        List<SalaryDiscountDto> discounts,
        BigDecimal plr,
        BigDecimal thirteenthSalary,
        String notes,

        // valores calculados
        BigDecimal calculatedInss,
        BigDecimal calculatedBaseIrrf,
        BigDecimal calculatedIrrf,
        BigDecimal calculatedTotalDiscounts,
        BigDecimal calculatedNetSalary,
        BigDecimal calculatedAnnualTotal
) {
    public static SalaryConfigResponse from(SalaryConfig c) {
        List<SalaryDiscountDto> discounts = c.getDiscounts().stream()
                .map(d -> new SalaryDiscountDto(d.getLabel(), d.getAmount()))
                .toList();

        return new SalaryConfigResponse(
                c.getId(), c.getYear(), c.getGrossSalary(),
                c.isManualInss(), c.getManualInssValue(), c.getDependents(),
                discounts, c.getPlr(), c.getThirteenthSalary(), c.getNotes(),
                c.getCalculatedInss(), c.getCalculatedBaseIrrf(), c.getCalculatedIrrf(),
                c.getCalculatedTotalDiscounts(), c.getCalculatedNetSalary(),
                c.getCalculatedAnnualTotal()
        );
    }
}
