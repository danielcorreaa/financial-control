package com.financial_control.financial_control.application.month.dto;

import com.financial_control.financial_control.application.expense.dto.ExpenseResponse;
import com.financial_control.financial_control.application.income.dto.IncomeResponse;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.MonthStatus;

import java.util.List;

/**
 * DTO de resposta de um mês financeiro com despesas e receitas.
 */
public record MonthResponse(
        String id,
        int month,
        int year,
        String monthName,
        MonthStatus status,
        String notes,
        List<ExpenseResponse> expenses,
        List<IncomeResponse> incomes
) {
    public static MonthResponse from(FinancialMonth financialMonth) {
        return new MonthResponse(
                financialMonth.getId(),
                financialMonth.getMonth().getValue(),
                financialMonth.getYear(),
                financialMonth.getMonth().name(),
                financialMonth.getStatus(),
                financialMonth.getNotes(),
                financialMonth.getExpenses().stream().map(ExpenseResponse::from).toList(),
                financialMonth.getIncomes().stream().map(IncomeResponse::from).toList()
        );
    }
}
