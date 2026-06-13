package com.financial_control.financial_control.infrastructure.persistence.budget;

import com.financial_control.financial_control.domain.budget.CategoryBudget;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "category_budgets")
public class CategoryBudgetDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private int year;

    private Map<ExpenseCategory, BigDecimal> limits = new HashMap<>();

    public static CategoryBudgetDocument from(CategoryBudget domain) {
        return new CategoryBudgetDocument(domain.getId(), domain.getYear(), new HashMap<>(domain.getLimits()));
    }

    public CategoryBudget toDomain() {
        return new CategoryBudget(id, year, limits);
    }
}
