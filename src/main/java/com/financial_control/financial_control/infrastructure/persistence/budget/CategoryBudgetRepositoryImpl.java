package com.financial_control.financial_control.infrastructure.persistence.budget;

import com.financial_control.financial_control.domain.budget.CategoryBudget;
import com.financial_control.financial_control.domain.budget.CategoryBudgetRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CategoryBudgetRepositoryImpl implements CategoryBudgetRepository {

    private final MongoCategoryBudgetRepository mongo;

    public CategoryBudgetRepositoryImpl(MongoCategoryBudgetRepository mongo) {
        this.mongo = mongo;
    }

    @Override
    public CategoryBudget save(CategoryBudget budget) {
        return mongo.save(CategoryBudgetDocument.from(budget)).toDomain();
    }

    @Override
    public Optional<CategoryBudget> findByYear(int year) {
        return mongo.findByYear(year).map(CategoryBudgetDocument::toDomain);
    }
}
