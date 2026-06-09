package com.financial_control.financial_control.infrastructure.persistence.project;

import com.financial_control.financial_control.domain.project.ProjectExpense;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectExpenseDocument {

    private String id;
    private String description;
    private BigDecimal amount;
    private boolean paid;
    private String notes;

    private Integer debitMonth;
    private Integer debitYear;
    private String debitSource;

    private boolean launched;
    private String launchedExpenseId;
    private String launchedMonthId;

    public static ProjectExpenseDocument from(ProjectExpense e) {
        return new ProjectExpenseDocument(
                e.getId(), e.getDescription(), e.getAmount(), e.isPaid(), e.getNotes(),
                e.getDebitMonth(), e.getDebitYear(), e.getDebitSource(),
                e.isLaunched(), e.getLaunchedExpenseId(), e.getLaunchedMonthId()
        );
    }

    public ProjectExpense toDomain() {
        return new ProjectExpense(id, description, amount, paid, notes,
                debitMonth, debitYear, debitSource,
                launched, launchedExpenseId, launchedMonthId);
    }
}
