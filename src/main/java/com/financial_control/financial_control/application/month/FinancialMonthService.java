package com.financial_control.financial_control.application.month;

import com.financial_control.financial_control.application.expense.dto.CreateExpenseCommand;
import com.financial_control.financial_control.application.expense.dto.ExpenseResponse;
import com.financial_control.financial_control.application.expense.dto.PayExpenseCommand;
import com.financial_control.financial_control.application.expense.dto.UpdateExpenseCommand;
import com.financial_control.financial_control.application.income.dto.CreateIncomeCommand;
import com.financial_control.financial_control.application.income.dto.IncomeResponse;
import com.financial_control.financial_control.application.income.dto.UpdateIncomeCommand;
import com.financial_control.financial_control.application.month.dto.CreateMonthCommand;
import com.financial_control.financial_control.application.month.dto.MonthResponse;
import com.financial_control.financial_control.application.month.dto.MonthSummaryResponse;
import com.financial_control.financial_control.application.month.dto.UpdateMonthCommand;
import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.expense.ExpenseStatus;
import com.financial_control.financial_control.domain.income.Income;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.FinancialMonthRepository;
import com.financial_control.financial_control.infrastructure.exception.DuplicateResourceException;
import com.financial_control.financial_control.infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.util.List;

/**
 * Serviço de aplicação responsável pelos casos de uso de meses financeiros.
 * Orquestra o domínio e coordena persistência.
 */
@Service
public class FinancialMonthService {

    private final FinancialMonthRepository repository;

    public FinancialMonthService(FinancialMonthRepository repository) {
        this.repository = repository;
    }

    // -------------------------------------------------------------------------
    // Gestão de meses
    // -------------------------------------------------------------------------

    public MonthResponse createMonth(CreateMonthCommand command) {
        Month month = Month.of(command.month());
        if (repository.existsByMonthAndYear(month, command.year())) {
            throw new DuplicateResourceException(
                    "Mês financeiro já existe: " + month.name() + "/" + command.year());
        }
        FinancialMonth financialMonth = new FinancialMonth(month, command.year(), command.notes());
        return MonthResponse.from(repository.save(financialMonth));
    }

    public MonthResponse getMonth(String id) {
        return MonthResponse.from(findMonthOrThrow(id));
    }

    public List<MonthResponse> getAllMonths() {
        return repository.findAll().stream()
                .map(MonthResponse::from)
                .toList();
    }

    public List<MonthResponse> getMonthsByYear(int year) {
        return repository.findByYear(year).stream()
                .map(MonthResponse::from)
                .toList();
    }

    public MonthResponse updateMonth(String id, UpdateMonthCommand command) {
        FinancialMonth financialMonth = findMonthOrThrow(id);
        financialMonth.updateNotes(command.notes());
        return MonthResponse.from(repository.save(financialMonth));
    }

    public MonthResponse closeMonth(String id) {
        FinancialMonth financialMonth = findMonthOrThrow(id);
        financialMonth.close();
        return MonthResponse.from(repository.save(financialMonth));
    }

    public MonthResponse reopenMonth(String id) {
        FinancialMonth financialMonth = findMonthOrThrow(id);
        financialMonth.reopen();
        return MonthResponse.from(repository.save(financialMonth));
    }

    public MonthSummaryResponse getSummary(String id) {
        return MonthSummaryResponse.from(findMonthOrThrow(id));
    }

    public void deleteMonth(String id) {
        findMonthOrThrow(id); // valida existência
        repository.deleteById(id);
    }

    // -------------------------------------------------------------------------
    // Gestão de despesas
    // -------------------------------------------------------------------------

    public ExpenseResponse addExpense(String monthId, CreateExpenseCommand command) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        Expense expense = financialMonth.addExpense(
                command.name(), command.category(), command.amount(),
                command.dueDate(), command.notes());
        repository.save(financialMonth);
        return ExpenseResponse.from(expense);
    }

    public ExpenseResponse updateExpense(String monthId, String expenseId, UpdateExpenseCommand command) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        financialMonth.updateExpense(expenseId, command.name(), command.category(),
                command.amount(), command.dueDate(), command.notes());
        repository.save(financialMonth);
        return findExpenseResponse(financialMonth, expenseId);
    }

    public void removeExpense(String monthId, String expenseId) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        financialMonth.removeExpense(expenseId);
        repository.save(financialMonth);
    }

    public ExpenseResponse payExpense(String monthId, String expenseId, PayExpenseCommand command) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        financialMonth.payExpense(expenseId, command.paymentDate());
        repository.save(financialMonth);
        return findExpenseResponse(financialMonth, expenseId);
    }

    public ExpenseResponse unpayExpense(String monthId, String expenseId) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        financialMonth.unpayExpense(expenseId);
        repository.save(financialMonth);
        return findExpenseResponse(financialMonth, expenseId);
    }

    public List<ExpenseResponse> getExpenses(String monthId) {
        return findMonthOrThrow(monthId).getExpenses().stream()
                .map(ExpenseResponse::from)
                .toList();
    }

    public List<ExpenseResponse> getPaidExpenses(String monthId) {
        return findMonthOrThrow(monthId).getPaidExpenses().stream()
                .map(ExpenseResponse::from)
                .toList();
    }

    public List<ExpenseResponse> getPendingExpenses(String monthId) {
        return findMonthOrThrow(monthId).getPendingExpenses().stream()
                .map(ExpenseResponse::from)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Gestão de receitas
    // -------------------------------------------------------------------------

    public IncomeResponse addIncome(String monthId, CreateIncomeCommand command) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        Income income = financialMonth.addIncome(
                command.description(), command.amount(), command.type(),
                command.date(), command.notes());
        repository.save(financialMonth);
        return IncomeResponse.from(income);
    }

    public IncomeResponse updateIncome(String monthId, String incomeId, UpdateIncomeCommand command) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        financialMonth.updateIncome(incomeId, command.description(), command.amount(),
                command.type(), command.date(), command.notes());
        repository.save(financialMonth);
        return findIncomeResponse(financialMonth, incomeId);
    }

    public void removeIncome(String monthId, String incomeId) {
        FinancialMonth financialMonth = findMonthOrThrow(monthId);
        financialMonth.removeIncome(incomeId);
        repository.save(financialMonth);
    }

    public List<IncomeResponse> getIncomes(String monthId) {
        return findMonthOrThrow(monthId).getIncomes().stream()
                .map(IncomeResponse::from)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private FinancialMonth findMonthOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mês financeiro não encontrado: " + id));
    }

    private ExpenseResponse findExpenseResponse(FinancialMonth month, String expenseId) {
        return month.getExpenses().stream()
                .filter(e -> e.getId().equals(expenseId))
                .map(ExpenseResponse::from)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada: " + expenseId));
    }

    private IncomeResponse findIncomeResponse(FinancialMonth month, String incomeId) {
        return month.getIncomes().stream()
                .filter(i -> i.getId().equals(incomeId))
                .map(IncomeResponse::from)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada: " + incomeId));
    }
}
