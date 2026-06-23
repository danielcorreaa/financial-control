package com.financial_control.financial_control.application.card.dto;

import com.financial_control.financial_control.domain.card.CardBank;
import com.financial_control.financial_control.domain.card.CardInvoice;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CardInvoiceResponse(
        String id,
        CardBank bank,
        String bankLabel,
        String cardName,
        LocalDate dueDate,
        double totalAmount,
        String monthId,
        String expenseId,
        LocalDateTime createdAt
) {
    public static CardInvoiceResponse from(CardInvoice invoice) {
        return new CardInvoiceResponse(
                invoice.getId(),
                invoice.getBank(),
                invoice.getBank().getLabel(),
                invoice.getCardName(),
                invoice.getDueDate(),
                invoice.getTotalAmount(),
                invoice.getMonthId(),
                invoice.getExpenseId(),
                invoice.getCreatedAt()
        );
    }
}
