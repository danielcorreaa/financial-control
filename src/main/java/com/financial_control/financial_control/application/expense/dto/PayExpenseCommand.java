package com.financial_control.financial_control.application.expense.dto;

import java.time.LocalDate;

/**
 * Comando para marcar uma despesa como paga, com data opcional de pagamento.
 */
public record PayExpenseCommand(
        LocalDate paymentDate
) {}
