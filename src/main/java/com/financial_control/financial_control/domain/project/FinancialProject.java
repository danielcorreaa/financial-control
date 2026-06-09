package com.financial_control.financial_control.domain.project;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Agregado raiz de um projeto financeiro extraordinário.
 * Exemplos: mudança de apartamento, reforma, compra de móveis.
 */
public class FinancialProject {

    private final String id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProjectStatus status;
    private final List<ProjectExpense> expenses;

    // Construtor para criação
    public FinancialProject(String name, String description, LocalDate startDate, LocalDate endDate) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = ProjectStatus.EM_ANDAMENTO;
        this.expenses = new ArrayList<>();
    }

    // Construtor de reconstituição
    public FinancialProject(String id, String name, String description, LocalDate startDate,
                            LocalDate endDate, ProjectStatus status, List<ProjectExpense> expenses) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.expenses = new ArrayList<>(expenses);
    }

    // -------------------------------------------------------------------------
    // Comandos de despesas
    // -------------------------------------------------------------------------

    public ProjectExpense addExpense(String description, BigDecimal amount, String notes,
                                     Integer debitMonth, Integer debitYear, String debitSource) {
        ensureNotCancelled();
        ProjectExpense expense = new ProjectExpense(description, amount, notes,
                debitMonth, debitYear, debitSource);
        this.expenses.add(expense);
        return expense;
    }

    public void updateExpense(String expenseId, String description, BigDecimal amount, String notes,
                              Integer debitMonth, Integer debitYear, String debitSource) {
        ensureNotCancelled();
        findExpenseById(expenseId).update(description, amount, notes, debitMonth, debitYear, debitSource);
    }

    public void removeExpense(String expenseId) {
        ensureNotCancelled();
        ProjectExpense expense = findExpenseById(expenseId);
        this.expenses.remove(expense);
    }

    public void payExpense(String expenseId) {
        findExpenseById(expenseId).markAsPaid();
    }

    public void unpayExpense(String expenseId) {
        findExpenseById(expenseId).unmarkPayment();
    }

    // -------------------------------------------------------------------------
    // Ciclo de vida do projeto
    // -------------------------------------------------------------------------

    public void update(String name, String description, LocalDate startDate, LocalDate endDate) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void finish() {
        if (ProjectStatus.CANCELADO.equals(this.status)) {
            throw new IllegalStateException("Projeto cancelado não pode ser finalizado.");
        }
        this.status = ProjectStatus.FINALIZADO;
    }

    public void cancel() {
        this.status = ProjectStatus.CANCELADO;
    }

    public void reopen() {
        this.status = ProjectStatus.EM_ANDAMENTO;
    }

    // -------------------------------------------------------------------------
    // Consultas calculadas
    // -------------------------------------------------------------------------

    public BigDecimal getTotalAmount() {
        return expenses.stream()
                .map(ProjectExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalPaid() {
        return expenses.stream()
                .filter(ProjectExpense::isPaid)
                .map(ProjectExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalPending() {
        return expenses.stream()
                .filter(e -> !e.isPaid())
                .map(ProjectExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private ProjectExpense findExpenseById(String expenseId) {
        return expenses.stream()
                .filter(e -> e.getId().equals(expenseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Despesa de projeto não encontrada: " + expenseId));
    }

    private void ensureNotCancelled() {
        if (ProjectStatus.CANCELADO.equals(this.status)) {
            throw new IllegalStateException("Não é possível alterar um projeto cancelado.");
        }
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public ProjectStatus getStatus() { return status; }
    public List<ProjectExpense> getExpenses() { return Collections.unmodifiableList(expenses); }
}
