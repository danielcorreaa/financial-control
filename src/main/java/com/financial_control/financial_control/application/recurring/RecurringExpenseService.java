package com.financial_control.financial_control.application.recurring;

import com.financial_control.financial_control.application.recurring.dto.CreateRecurringExpenseCommand;
import com.financial_control.financial_control.application.recurring.dto.RecurringExpenseResponse;
import com.financial_control.financial_control.application.recurring.dto.UpdateRecurringExpenseCommand;
import com.financial_control.financial_control.domain.recurring.RecurringExpense;
import com.financial_control.financial_control.domain.recurring.RecurringExpenseRepository;
import com.financial_control.financial_control.infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecurringExpenseService {

    private final RecurringExpenseRepository repository;

    public RecurringExpenseService(RecurringExpenseRepository repository) {
        this.repository = repository;
    }

    public RecurringExpenseResponse create(CreateRecurringExpenseCommand command) {
        RecurringExpense expense = new RecurringExpense(
                command.name(), command.category(), command.amount(), command.dayOfMonth());
        return RecurringExpenseResponse.from(repository.save(expense));
    }

    public RecurringExpenseResponse update(String id, UpdateRecurringExpenseCommand command) {
        RecurringExpense expense = findOrThrow(id);
        expense.update(command.name(), command.category(), command.amount(), command.dayOfMonth());
        return RecurringExpenseResponse.from(repository.save(expense));
    }

    public RecurringExpenseResponse toggleActive(String id) {
        RecurringExpense expense = findOrThrow(id);
        if (expense.isActive()) expense.deactivate();
        else expense.activate();
        return RecurringExpenseResponse.from(repository.save(expense));
    }

    public List<RecurringExpenseResponse> findAll() {
        return repository.findAll().stream()
                .map(RecurringExpenseResponse::from)
                .toList();
    }

    public List<RecurringExpense> findAllActive() {
        return repository.findAllActive();
    }

    public void delete(String id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private RecurringExpense findOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa recorrente não encontrada: " + id));
    }
}
