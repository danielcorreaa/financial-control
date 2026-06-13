package com.financial_control.financial_control.domain.recurring;

import java.util.List;
import java.util.Optional;

public interface RecurringExpenseRepository {
    RecurringExpense save(RecurringExpense expense);
    Optional<RecurringExpense> findById(String id);
    List<RecurringExpense> findAll();
    List<RecurringExpense> findAllActive();
    void deleteById(String id);
    boolean existsById(String id);
}
