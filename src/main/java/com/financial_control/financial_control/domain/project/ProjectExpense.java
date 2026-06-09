package com.financial_control.financial_control.domain.project;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Entidade de despesa pertencente a um projeto financeiro extraordinário.
 */
public class ProjectExpense {

    private final String id;
    private String description;
    private BigDecimal amount;
    private boolean paid;
    private String notes;

    // Vínculo de débito: mês/ano destino (opcional)
    private Integer debitMonth; // 1-12
    private Integer debitYear;

    // Fonte especial: PLR, DECIMO_TERCEIRO, SALARIO, etc. (opcional)
    private String debitSource;

    // Se já foi lançada no mês (evita lançamento duplicado)
    private boolean launched;
    private String launchedExpenseId;   // id da Expense criada no mês
    private String launchedMonthId;     // id do mês onde foi lançada

    // Construtor para criação
    public ProjectExpense(String description, BigDecimal amount, String notes,
                          Integer debitMonth, Integer debitYear, String debitSource) {
        this.id = UUID.randomUUID().toString();
        this.description = description;
        this.amount = amount;
        this.paid = false;
        this.notes = notes;
        this.debitMonth = debitMonth;
        this.debitYear = debitYear;
        this.debitSource = debitSource;
        this.launched = false;
    }

    // Construtor de reconstituição
    public ProjectExpense(String id, String description, BigDecimal amount, boolean paid,
                          String notes, Integer debitMonth, Integer debitYear,
                          String debitSource, boolean launched,
                          String launchedExpenseId, String launchedMonthId) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.paid = paid;
        this.notes = notes;
        this.debitMonth = debitMonth;
        this.debitYear = debitYear;
        this.debitSource = debitSource;
        this.launched = launched;
        this.launchedExpenseId = launchedExpenseId;
        this.launchedMonthId = launchedMonthId;
    }

    public void update(String description, BigDecimal amount, String notes,
                       Integer debitMonth, Integer debitYear, String debitSource) {
        this.description = description;
        this.amount = amount;
        this.notes = notes;
        this.debitMonth = debitMonth;
        this.debitYear = debitYear;
        this.debitSource = debitSource;
    }

    public void markAsLaunched(String expenseId, String monthId) {
        this.launched = true;
        this.launchedExpenseId = expenseId;
        this.launchedMonthId = monthId;
    }

    public void unlaunch() {
        this.launched = false;
        this.launchedExpenseId = null;
        this.launchedMonthId = null;
    }

    public void markAsPaid() { this.paid = true; }
    public void unmarkPayment() { this.paid = false; }

    // Getters
    public String getId() { return id; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public boolean isPaid() { return paid; }
    public String getNotes() { return notes; }
    public Integer getDebitMonth() { return debitMonth; }
    public Integer getDebitYear() { return debitYear; }
    public String getDebitSource() { return debitSource; }
    public boolean isLaunched() { return launched; }
    public String getLaunchedExpenseId() { return launchedExpenseId; }
    public String getLaunchedMonthId() { return launchedMonthId; }
}
