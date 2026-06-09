package com.financial_control.financial_control.application.dashboard;

import com.financial_control.financial_control.application.month.dto.MonthSummaryResponse;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO de resposta do dashboard financeiro consolidado.
 */
public record DashboardResponse(
        int year,
        BigDecimal totalAnnualIncomes,
        BigDecimal totalAnnualExpenses,
        BigDecimal totalAnnualBalance,
        BigDecimal accumulatedBalance,
        List<MonthSummaryResponse> months
) {}
