package com.financial_control.financial_control.infrastructure.persistence.recurring;

import com.financial_control.financial_control.domain.recurring.RecurringExpense;
import com.financial_control.financial_control.domain.recurring.RecurringExpenseRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class RecurringExpenseRepositoryImpl implements RecurringExpenseRepository {

    private final MongoRecurringExpenseRepository mongo;

    public RecurringExpenseRepositoryImpl(MongoRecurringExpenseRepository mongo) {
        this.mongo = mongo;
    }

    @Override
    public RecurringExpense save(RecurringExpense expense) {
        return mongo.save(RecurringExpenseDocument.from(expense)).toDomain();
    }

    @Override
    public Optional<RecurringExpense> findById(String id) {
        return mongo.findById(id).map(RecurringExpenseDocument::toDomain);
    }

    @Override
    public List<RecurringExpense> findAll() {
        return mongo.findAll().stream().map(RecurringExpenseDocument::toDomain).toList();
    }

    @Override
    public List<RecurringExpense> findAllActive() {
        return mongo.findByActiveTrue().stream().map(RecurringExpenseDocument::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        mongo.deleteById(id);
    }

    @Override
    public boolean existsById(String id) {
        return mongo.existsById(id);
    }
}
