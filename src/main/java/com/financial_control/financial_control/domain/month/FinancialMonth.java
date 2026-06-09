package com.financial_control.financial_control.domain.month;

import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.expense.ExpenseStatus;
import com.financial_control.financial_control.domain.income.Income;
import com.financial_control.financial_control.domain.income.IncomeType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Agregado raiz que representa um mês financeiro.
 * Gerencia despesas e receitas do mês, garantindo invariantes de domínio.
 */
public class FinancialMonth {

    private final String id;
    private final Month month;
    private final int year;
    private MonthStatus status;
    private String notes;
    private final List<Expense> expenses;
    private final List<Income> incomes;

    // Construtor para criação de novo mês
    public FinancialMonth(Month month, int year, String notes) {
        this.id = UUID.randomUUID().toString();
        this.month = month;
        this.year = year;
        this.status = MonthStatus.ABERTO;
        this.notes = notes;
        this.expenses = new ArrayList<>();
        this.incomes = new ArrayList<>();
    }

    // Construtor de reconstituição (usado pela infraestrutura)
    public FinancialMonth(String id, Month month, int year, MonthStatus status,
                          String notes, List<Expense> expenses, List<Income> incomes) {
        this.id = id;
        this.month = month;
        this.year = year;
        this.status = status;
        this.notes = notes;
        this.expenses = new ArrayList<>(expenses);
        this.incomes = new ArrayList<>(incomes);
    }

    // -------------------------------------------------------------------------
    // Comandos de despesas
    // -------------------------------------------------------------------------

    /**
     * Adiciona uma nova despesa ao mês. Meses fechados não aceitam novas despesas.
     */
    public Expense addExpense(String name, ExpenseCategory category, BigDecimal amount,
                              LocalDate dueDate, String notes) {
        ensureOpen();
        Expense expense = new Expense(name, category, amount, dueDate, notes);
        this.expenses.add(expense);
        return expense;
    }

    /**
     * Edita uma despesa existente.
     */
    public void updateExpense(String expenseId, String name, ExpenseCategory category,
                              BigDecimal amount, LocalDate dueDate, String notes) {
        ensureOpen();
        Expense expense = findExpenseById(expenseId);
        expense.update(name, category, amount, dueDate, notes);
    }

    /**
     * Remove uma despesa do mês.
     */
    public void removeExpense(String expenseId) {
        ensureOpen();
        Expense expense = findExpenseById(expenseId);
        this.expenses.remove(expense);
    }

    /**
     * Marca uma despesa como paga.
     */
    public void payExpense(String expenseId, LocalDate paymentDate) {
        Expense expense = findExpenseById(expenseId);
        expense.markAsPaid(paymentDate);
    }

    /**
     * Desmarca o pagamento de uma despesa.
     */
    public void unpayExpense(String expenseId) {
        Expense expense = findExpenseById(expenseId);
        expense.unmarkPayment();
    }

    // -------------------------------------------------------------------------
    // Comandos de receitas
    // -------------------------------------------------------------------------

    /**
     * Adiciona uma nova receita ao mês.
     */
    public Income addIncome(String description, BigDecimal amount, IncomeType type,
                            LocalDate date, String notes) {
        ensureOpen();
        Income income = new Income(description, amount, type, date, notes);
        this.incomes.add(income);
        return income;
    }

    /**
     * Remove uma receita do mês.
     */
    public void removeIncome(String incomeId) {
        ensureOpen();
        Income income = findIncomeById(incomeId);
        this.incomes.remove(income);
    }

    /**
     * Atualiza uma receita existente.
     */
    public void updateIncome(String incomeId, String description, BigDecimal amount,
                             IncomeType type, LocalDate date, String notes) {
        ensureOpen();
        Income income = findIncomeById(incomeId);
        income.update(description, amount, type, date, notes);
    }

    // -------------------------------------------------------------------------
    // Ciclo de vida do mês
    // -------------------------------------------------------------------------

    /**
     * Fecha o mês financeiro. Meses fechados não permitem mais alterações de despesas.
     */
    public void close() {
        if (MonthStatus.FECHADO.equals(this.status)) {
            throw new IllegalStateException("O mês já está fechado.");
        }
        this.status = MonthStatus.FECHADO;
    }

    /**
     * Reabre um mês financeiro fechado, permitindo novas alterações.
     */
    public void reopen() {
        if (MonthStatus.ABERTO.equals(this.status)) {
            throw new IllegalStateException("O mês já está aberto.");
        }
        this.status = MonthStatus.ABERTO;
    }

    /**
     * Atualiza as observações do mês.
     */
    public void updateNotes(String notes) {
        this.notes = notes;
    }

    // -------------------------------------------------------------------------
    // Consultas calculadas
    // -------------------------------------------------------------------------

    public BigDecimal getTotalExpenses() {
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalPaid() {
        return expenses.stream()
                .filter(Expense::isPaid)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalPending() {
        return expenses.stream()
                .filter(e -> !e.isPaid())
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalIncomes() {
        return incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getBalance() {
        return getTotalIncomes().subtract(getTotalExpenses());
    }

    public List<Expense> getPaidExpenses() {
        return expenses.stream()
                .filter(Expense::isPaid)
                .toList();
    }

    public List<Expense> getPendingExpenses() {
        return expenses.stream()
                .filter(e -> !e.isPaid())
                .toList();
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private Expense findExpenseById(String expenseId) {
        return expenses.stream()
                .filter(e -> e.getId().equals(expenseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Despesa não encontrada: " + expenseId));
    }

    private Income findIncomeById(String incomeId) {
        return incomes.stream()
                .filter(i -> i.getId().equals(incomeId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Receita não encontrada: " + incomeId));
    }

    private void ensureOpen() {
        if (MonthStatus.FECHADO.equals(this.status)) {
            throw new IllegalStateException(
                    "Não é possível realizar alterações em um mês financeiro fechado.");
        }
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public String getId() { return id; }
    public Month getMonth() { return month; }
    public int getYear() { return year; }
    public MonthStatus getStatus() { return status; }
    public String getNotes() { return notes; }
    public List<Expense> getExpenses() { return Collections.unmodifiableList(expenses); }
    public List<Income> getIncomes() { return Collections.unmodifiableList(incomes); }
}
