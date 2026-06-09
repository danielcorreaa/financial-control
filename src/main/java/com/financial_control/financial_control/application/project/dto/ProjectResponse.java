package com.financial_control.financial_control.application.project.dto;

import com.financial_control.financial_control.domain.project.FinancialProject;
import com.financial_control.financial_control.domain.project.ProjectStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de resposta de um projeto financeiro extraordinário.
 */
public record ProjectResponse(
        String id,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        ProjectStatus status,
        BigDecimal totalAmount,
        BigDecimal totalPaid,
        BigDecimal totalPending,
        List<ProjectExpenseResponse> expenses
) {
    public static ProjectResponse from(FinancialProject project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate(),
                project.getStatus(),
                project.getTotalAmount(),
                project.getTotalPaid(),
                project.getTotalPending(),
                project.getExpenses().stream().map(ProjectExpenseResponse::from).toList()
        );
    }
}
