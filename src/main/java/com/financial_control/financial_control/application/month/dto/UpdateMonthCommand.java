package com.financial_control.financial_control.application.month.dto;

/**
 * Comando para atualização das observações de um mês financeiro.
 */
public record UpdateMonthCommand(
        String notes
) {}
