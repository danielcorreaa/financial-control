package com.financial_control.financial_control.infrastructure.persistence.month;

import com.financial_control.financial_control.domain.income.Income;
import com.financial_control.financial_control.domain.income.IncomeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Documento MongoDB embutido representando uma receita dentro de FinancialMonthDocument.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncomeDocument {

    private String id;
    private String description;
    private BigDecimal amount;
    private IncomeType type;
    private LocalDate date;
    private String notes;

    public static IncomeDocument from(Income income) {
        return new IncomeDocument(
                income.getId(),
                income.getDescription(),
                income.getAmount(),
                income.getType(),
                income.getDate(),
                income.getNotes()
        );
    }

    public Income toDomain() {
        return new Income(id, description, amount, type, date, notes);
    }
}
