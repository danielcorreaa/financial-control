package com.financial_control.financial_control.infrastructure.persistence.project;

import com.financial_control.financial_control.domain.project.FinancialProject;
import com.financial_control.financial_control.domain.project.ProjectExpense;
import com.financial_control.financial_control.domain.project.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Documento MongoDB para persistência do agregado FinancialProject.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "financial_projects")
public class FinancialProjectDocument {

    @Id
    private String id;

    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProjectStatus status;
    private List<ProjectExpenseDocument> expenses = new ArrayList<>();

    public static FinancialProjectDocument from(FinancialProject domain) {
        List<ProjectExpenseDocument> expenses = domain.getExpenses().stream()
                .map(ProjectExpenseDocument::from)
                .toList();

        return new FinancialProjectDocument(
                domain.getId(),
                domain.getName(),
                domain.getDescription(),
                domain.getStartDate(),
                domain.getEndDate(),
                domain.getStatus(),
                new ArrayList<>(expenses)
        );
    }

    public FinancialProject toDomain() {
        List<ProjectExpense> expenses = this.expenses.stream()
                .map(ProjectExpenseDocument::toDomain)
                .toList();

        return new FinancialProject(id, name, description, startDate, endDate, status, expenses);
    }
}
