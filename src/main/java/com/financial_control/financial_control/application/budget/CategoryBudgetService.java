package com.financial_control.financial_control.application.budget;

import com.financial_control.financial_control.application.budget.dto.BudgetResponse;
import com.financial_control.financial_control.application.budget.dto.SaveBudgetCommand;
import com.financial_control.financial_control.domain.budget.CategoryBudget;
import com.financial_control.financial_control.domain.budget.CategoryBudgetRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryBudgetService {

    private final CategoryBudgetRepository repository;

    public CategoryBudgetService(CategoryBudgetRepository repository) {
        this.repository = repository;
    }

    public BudgetResponse getOrEmpty(int year) {
        return repository.findByYear(year)
                .map(BudgetResponse::from)
                .orElse(new BudgetResponse(null, year, java.util.Map.of()));
    }

    public BudgetResponse save(int year, SaveBudgetCommand command) {
        CategoryBudget budget = repository.findByYear(year)
                .orElse(new CategoryBudget(year));
        budget.updateLimits(command.limits());
        return BudgetResponse.from(repository.save(budget));
    }
}
