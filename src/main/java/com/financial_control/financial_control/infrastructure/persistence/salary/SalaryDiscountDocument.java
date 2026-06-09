package com.financial_control.financial_control.infrastructure.persistence.salary;

import com.financial_control.financial_control.domain.salary.SalaryDiscount;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryDiscountDocument {
    private String label;
    private BigDecimal amount;

    public static SalaryDiscountDocument from(SalaryDiscount d) {
        return new SalaryDiscountDocument(d.getLabel(), d.getAmount());
    }

    public SalaryDiscount toDomain() {
        return new SalaryDiscount(label, amount);
    }
}
