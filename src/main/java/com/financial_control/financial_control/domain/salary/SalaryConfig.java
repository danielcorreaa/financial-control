package com.financial_control.financial_control.domain.salary;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Agregado que representa a configuração salarial de um ano.
 * Persiste salário bruto, descontos e armazena os valores calculados.
 */
public class SalaryConfig {

    // Tabela IRRF 2024 (validada contra planilha real)
    private static final double[][] IRRF_FAIXAS = {
        {2259.20,  0.0,    0.0     },
        {2826.65,  0.075,  169.44  },
        {3751.05,  0.15,   381.44  },
        {4664.68,  0.225,  662.77  },
        {Double.MAX_VALUE, 0.275,  896.00  },
    };

    // Tabela INSS 2025 (progressiva)
    private static final double[][] INSS_FAIXAS = {
        {1518.00,  0.075},
        {2793.88,  0.09 },
        {4190.83,  0.12 },
        {8157.41,  0.14 },
    };
    private static final double INSS_TETO = 908.86;

    private final String id;
    private int year;
    private BigDecimal grossSalary;          // Salário Bruto (A)
    private boolean manualInss;
    private BigDecimal manualInssValue;      // INSS informado manualmente
    private int dependents;                  // Dependentes para dedução IRRF
    private List<SalaryDiscount> discounts;  // VR, Odonto, Prev. Privada, etc.
    private BigDecimal plr;                  // PLR do ano
    private BigDecimal thirteenthSalary;     // 13º salário
    private String notes;

    // Valores calculados (persistidos para histórico)
    private BigDecimal calculatedInss;
    private BigDecimal calculatedIrrf;
    private BigDecimal calculatedBaseIrrf;
    private BigDecimal calculatedNetSalary;
    private BigDecimal calculatedTotalDiscounts;
    private BigDecimal calculatedAnnualTotal;

    public SalaryConfig(int year, BigDecimal grossSalary, boolean manualInss,
                        BigDecimal manualInssValue, int dependents,
                        List<SalaryDiscount> discounts, BigDecimal plr,
                        BigDecimal thirteenthSalary, String notes) {
        this.id = UUID.randomUUID().toString();
        this.year = year;
        this.grossSalary = grossSalary;
        this.manualInss = manualInss;
        this.manualInssValue = manualInssValue;
        this.dependents = dependents;
        this.discounts = new ArrayList<>(discounts != null ? discounts : List.of());
        this.plr = plr != null ? plr : BigDecimal.ZERO;
        this.thirteenthSalary = thirteenthSalary != null ? thirteenthSalary : BigDecimal.ZERO;
        this.notes = notes;
        recalculate();
    }

    // Construtor de reconstituição
    public SalaryConfig(String id, int year, BigDecimal grossSalary, boolean manualInss,
                        BigDecimal manualInssValue, int dependents,
                        List<SalaryDiscount> discounts, BigDecimal plr,
                        BigDecimal thirteenthSalary, String notes) {
        this.id = id;
        this.year = year;
        this.grossSalary = grossSalary;
        this.manualInss = manualInss;
        this.manualInssValue = manualInssValue;
        this.dependents = dependents;
        this.discounts = new ArrayList<>(discounts != null ? discounts : List.of());
        this.plr = plr != null ? plr : BigDecimal.ZERO;
        this.thirteenthSalary = thirteenthSalary != null ? thirteenthSalary : BigDecimal.ZERO;
        this.notes = notes;
        recalculate();
    }

    /**
     * Recalcula todos os valores derivados (INSS, IRRF, líquido, etc.)
     */
    public void recalculate() {
        double bruto = grossSalary != null ? grossSalary.doubleValue() : 0.0;

        // INSS
        double inss = manualInss && manualInssValue != null
                ? manualInssValue.doubleValue()
                : calcularINSS(bruto);
        this.calculatedInss = round2(inss);

        // Base IRRF = Bruto - INSS - (189,59 × dependentes)
        double deducaoDep = dependents * 189.59;
        double base = Math.max(0, bruto - inss - deducaoDep);
        this.calculatedBaseIrrf = round2(base);

        // IRRF
        double irrf = calcularIRRF(base);
        this.calculatedIrrf = round2(irrf);

        // Outros descontos
        double outrosDescontos = discounts.stream()
                .mapToDouble(d -> d.getAmount() != null ? d.getAmount().doubleValue() : 0.0)
                .sum();

        // Total descontos
        this.calculatedTotalDiscounts = round2(inss + irrf + outrosDescontos);

        // Líquido
        this.calculatedNetSalary = round2(Math.max(0, bruto - calculatedTotalDiscounts.doubleValue()));

        // Total anual = (líquido × 12) + 13º + PLR
        double net = calculatedNetSalary.doubleValue();
        double dec = thirteenthSalary != null ? thirteenthSalary.doubleValue() : 0.0;
        double plrVal = plr != null ? plr.doubleValue() : 0.0;
        this.calculatedAnnualTotal = round2(net * 12 + dec + plrVal);
    }

    public void update(BigDecimal grossSalary, boolean manualInss, BigDecimal manualInssValue,
                       int dependents, List<SalaryDiscount> discounts,
                       BigDecimal plr, BigDecimal thirteenthSalary, String notes) {
        this.grossSalary = grossSalary;
        this.manualInss = manualInss;
        this.manualInssValue = manualInssValue;
        this.dependents = dependents;
        this.discounts = new ArrayList<>(discounts != null ? discounts : List.of());
        this.plr = plr != null ? plr : BigDecimal.ZERO;
        this.thirteenthSalary = thirteenthSalary != null ? thirteenthSalary : BigDecimal.ZERO;
        this.notes = notes;
        recalculate();
    }

    // ── Cálculos internos ──────────────────────────────────────────────────────

    private static double calcularINSS(double bruto) {
        if (bruto > 8157.41) return INSS_TETO;
        double inss = 0;
        double baseAnterior = 0;
        for (double[] faixa : INSS_FAIXAS) {
            if (bruto <= baseAnterior) break;
            double baseNaFaixa = Math.min(bruto, faixa[0]) - baseAnterior;
            inss += baseNaFaixa * faixa[1];
            baseAnterior = faixa[0];
        }
        return Math.round(inss * 100.0) / 100.0;
    }

    private static double calcularIRRF(double base) {
        for (double[] faixa : IRRF_FAIXAS) {
            if (base <= faixa[0]) {
                double irrf = base * faixa[1] - faixa[2];
                return Math.max(0, Math.round(irrf * 100.0) / 100.0);
            }
        }
        return 0;
    }

    private static BigDecimal round2(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    // ── Getters ────────────────────────────────────────────────────────────────

    public String getId() { return id; }
    public int getYear() { return year; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public boolean isManualInss() { return manualInss; }
    public BigDecimal getManualInssValue() { return manualInssValue; }
    public int getDependents() { return dependents; }
    public List<SalaryDiscount> getDiscounts() { return Collections.unmodifiableList(discounts); }
    public BigDecimal getPlr() { return plr; }
    public BigDecimal getThirteenthSalary() { return thirteenthSalary; }
    public String getNotes() { return notes; }
    public BigDecimal getCalculatedInss() { return calculatedInss; }
    public BigDecimal getCalculatedIrrf() { return calculatedIrrf; }
    public BigDecimal getCalculatedBaseIrrf() { return calculatedBaseIrrf; }
    public BigDecimal getCalculatedNetSalary() { return calculatedNetSalary; }
    public BigDecimal getCalculatedTotalDiscounts() { return calculatedTotalDiscounts; }
    public BigDecimal getCalculatedAnnualTotal() { return calculatedAnnualTotal; }
}
