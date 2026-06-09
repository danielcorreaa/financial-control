package com.financial_control.financial_control.domain.income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entidade de domínio representando uma receita (provento) dentro de um mês financeiro.
 * Pertence ao agregado FinancialMonth.
 */
public class Income {

    private final String id;
    private String description;
    private BigDecimal amount;
    private IncomeType type;
    private LocalDate date;
    private String notes;

    // Construtor para criação de nova receita
    public Income(String description, BigDecimal amount, IncomeType type, LocalDate date, String notes) {
        this.id = UUID.randomUUID().toString();
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.date = date;
        this.notes = notes;
    }

    // Construtor de reconstituição (usado pela infraestrutura)
    public Income(String id, String description, BigDecimal amount, IncomeType type,
                  LocalDate date, String notes) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.date = date;
        this.notes = notes;
    }

    /**
     * Atualiza os dados da receita.
     */
    public void update(String description, BigDecimal amount, IncomeType type, LocalDate date, String notes) {
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.date = date;
        this.notes = notes;
    }

    // Getters
    public String getId() { return id; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public IncomeType getType() { return type; }
    public LocalDate getDate() { return date; }
    public String getNotes() { return notes; }
}
