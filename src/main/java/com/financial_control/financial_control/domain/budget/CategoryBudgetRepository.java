package com.financial_control.financial_control.domain.budget;

import java.util.Optional;

public interface CategoryBudgetRepository {
    CategoryBudget save(CategoryBudget budget);
    Optional<CategoryBudget> findByYear(int year);
}
