package com.financial_control.financial_control.domain.salary;

import java.math.BigDecimal;

/**
 * Value Object representando um desconto do holerite (VR, Odonto, Prev. Privada, etc.)
 */
public class SalaryDiscount {

    private String label;
    private BigDecimal amount;

    public SalaryDiscount(String label, BigDecimal amount) {
        this.label = label;
        this.amount = amount;
    }

    public String getLabel() { return label; }
    public BigDecimal getAmount() { return amount; }

    public void setLabel(String label) { this.label = label; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
