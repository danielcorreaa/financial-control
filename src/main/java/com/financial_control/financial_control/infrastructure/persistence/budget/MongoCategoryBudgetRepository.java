package com.financial_control.financial_control.infrastructure.persistence.budget;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoCategoryBudgetRepository extends MongoRepository<CategoryBudgetDocument, String> {
    Optional<CategoryBudgetDocument> findByYear(int year);
}
