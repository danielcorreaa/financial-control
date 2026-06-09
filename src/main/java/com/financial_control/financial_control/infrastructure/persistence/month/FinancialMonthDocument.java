package com.financial_control.financial_control.infrastructure.persistence.month;

import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.income.Income;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.MonthStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Month;
import java.util.ArrayList;
import java.util.List;

/**
 * Documento MongoDB para persistência do agregado FinancialMonth.
 * Despesas e receitas são armazenadas como documentos embutidos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "financial_months")
@CompoundIndex(name = "month_year_idx", def = "{'month': 1, 'year': 1}", unique = true)
public class FinancialMonthDocument {

    @Id
    private String id;

    private Month month;
    private int year;
    private MonthStatus status;
    private String notes;
    private List<ExpenseDocument> expenses = new ArrayList<>();
    private List<IncomeDocument> incomes = new ArrayList<>();

    public static FinancialMonthDocument from(FinancialMonth domain) {
        List<ExpenseDocument> expenses = domain.getExpenses().stream()
                .map(ExpenseDocument::from)
                .toList();
        List<IncomeDocument> incomes = domain.getIncomes().stream()
                .map(IncomeDocument::from)
                .toList();

        return new FinancialMonthDocument(
                domain.getId(),
                domain.getMonth(),
                domain.getYear(),
                domain.getStatus(),
                domain.getNotes(),
                new ArrayList<>(expenses),
                new ArrayList<>(incomes)
        );
    }

    public FinancialMonth toDomain() {
        List<Expense> expenses = this.expenses.stream()
                .map(ExpenseDocument::toDomain)
                .toList();
        List<Income> incomes = this.incomes.stream()
                .map(IncomeDocument::toDomain)
                .toList();

        return new FinancialMonth(id, month, year, status, notes, expenses, incomes);
    }
}
