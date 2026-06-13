package com.financial_control.financial_control.domain.recurring;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;

import java.math.BigDecimal;
import java.util.UUID;

public class RecurringExpense {

    private final String id;
    private String name;
    private ExpenseCategory category;
    private BigDecimal amount;
    private Integer dayOfMonth;
    private boolean active;

    public RecurringExpense(String name, ExpenseCategory category, BigDecimal amount, Integer dayOfMonth) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.active = true;
    }

    public RecurringExpense(String id, String name, ExpenseCategory category, BigDecimal amount,
                            Integer dayOfMonth, boolean active) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.active = active;
    }

    public void update(String name, ExpenseCategory category, BigDecimal amount, Integer dayOfMonth) {
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
    }

    public void activate()   { this.active = true; }
    public void deactivate() { this.active = false; }

    public String getId()          { return id; }
    public String getName()        { return name; }
    public ExpenseCategory getCategory() { return category; }
    public BigDecimal getAmount()  { return amount; }
    public Integer getDayOfMonth() { return dayOfMonth; }
    public boolean isActive()      { return active; }
}
