package com.financial_control.financial_control.infrastructure.persistence.month;

import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.expense.ExpenseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Documento MongoDB embutido representando uma despesa dentro de FinancialMonthDocument.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDocument {

    private String id;
    private String name;
    private ExpenseCategory category;
    private BigDecimal amount;
    private ExpenseStatus status;
    private LocalDate dueDate;
    private LocalDate paymentDate;
    private String notes;

    public static ExpenseDocument from(Expense expense) {
        return new ExpenseDocument(
                expense.getId(),
                expense.getName(),
                expense.getCategory(),
                expense.getAmount(),
                expense.getStatus(),
                expense.getDueDate(),
                expense.getPaymentDate(),
                expense.getNotes()
        );
    }

    public Expense toDomain() {
        return new Expense(id, name, category, amount, status, dueDate, paymentDate, notes);
    }
}
