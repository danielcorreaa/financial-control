package com.financial_control.financial_control.domain.expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entidade de domínio representando uma despesa dentro de um mês financeiro.
 * Pertence ao agregado FinancialMonth.
 */
public class Expense {

    private final String id;
    private String name;
    private ExpenseCategory category;
    private BigDecimal amount;
    private ExpenseStatus status;
    private LocalDate dueDate;
    private LocalDate paymentDate;
    private String notes;

    // Construtor para criação de nova despesa
    public Expense(String name, ExpenseCategory category, BigDecimal amount, LocalDate dueDate, String notes) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.dueDate = dueDate;
        this.notes = notes;
        this.status = ExpenseStatus.PENDENTE;
    }

    // Construtor de reconstituição (usado pela infraestrutura)
    public Expense(String id, String name, ExpenseCategory category, BigDecimal amount,
                   ExpenseStatus status, LocalDate dueDate, LocalDate paymentDate, String notes) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.status = status;
        this.dueDate = dueDate;
        this.paymentDate = paymentDate;
        this.notes = notes;
    }

    /**
     * Marca a despesa como paga, registrando a data de pagamento.
     */
    public void markAsPaid(LocalDate paymentDate) {
        this.status = ExpenseStatus.PAGO;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
    }

    /**
     * Desmarca o pagamento da despesa, voltando ao status pendente.
     */
    public void unmarkPayment() {
        this.status = ExpenseStatus.PENDENTE;
        this.paymentDate = null;
    }

    /**
     * Atualiza os dados da despesa.
     */
    public void update(String name, ExpenseCategory category, BigDecimal amount,
                       LocalDate dueDate, String notes) {
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.dueDate = dueDate;
        this.notes = notes;
    }

    public boolean isPaid() {
        return ExpenseStatus.PAGO.equals(this.status);
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public ExpenseCategory getCategory() { return category; }
    public BigDecimal getAmount() { return amount; }
    public ExpenseStatus getStatus() { return status; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public String getNotes() { return notes; }
}
