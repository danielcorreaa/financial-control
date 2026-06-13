package com.financial_control.financial_control.domain.budget;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CategoryBudget {

    private final String id;
    private int year;
    private Map<ExpenseCategory, BigDecimal> limits;

    public CategoryBudget(int year) {
        this.id = UUID.randomUUID().toString();
        this.year = year;
        this.limits = new HashMap<>();
    }

    public CategoryBudget(String id, int year, Map<ExpenseCategory, BigDecimal> limits) {
        this.id = id;
        this.year = year;
        this.limits = limits != null ? new HashMap<>(limits) : new HashMap<>();
    }

    public void setLimit(ExpenseCategory category, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            limits.remove(category);
        } else {
            limits.put(category, amount);
        }
    }

    public void updateLimits(Map<ExpenseCategory, BigDecimal> newLimits) {
        this.limits = newLimits != null ? new HashMap<>(newLimits) : new HashMap<>();
    }

    public String getId()                              { return id; }
    public int getYear()                               { return year; }
    public Map<ExpenseCategory, BigDecimal> getLimits(){ return Map.copyOf(limits); }
}
