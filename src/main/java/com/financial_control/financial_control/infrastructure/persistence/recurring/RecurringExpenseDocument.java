package com.financial_control.financial_control.infrastructure.persistence.recurring;

import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.recurring.RecurringExpense;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "recurring_expenses")
public class RecurringExpenseDocument {

    @Id
    private String id;
    private String name;
    private ExpenseCategory category;
    private BigDecimal amount;
    private Integer dayOfMonth;
    private boolean active;

    public static RecurringExpenseDocument from(RecurringExpense domain) {
        return new RecurringExpenseDocument(
                domain.getId(),
                domain.getName(),
                domain.getCategory(),
                domain.getAmount(),
                domain.getDayOfMonth(),
                domain.isActive()
        );
    }

    public RecurringExpense toDomain() {
        return new RecurringExpense(id, name, category, amount, dayOfMonth, active);
    }
}
