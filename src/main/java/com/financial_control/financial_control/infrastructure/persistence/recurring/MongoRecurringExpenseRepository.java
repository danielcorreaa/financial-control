package com.financial_control.financial_control.infrastructure.persistence.recurring;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MongoRecurringExpenseRepository extends MongoRepository<RecurringExpenseDocument, String> {
    List<RecurringExpenseDocument> findByActiveTrue();
}
