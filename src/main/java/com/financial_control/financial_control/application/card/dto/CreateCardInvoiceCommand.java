package com.financial_control.financial_control.application.card.dto;

import com.financial_control.financial_control.domain.card.CardBank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateCardInvoiceCommand(
        @NotNull CardBank bank,
        String cardName,
        @NotNull LocalDate dueDate,
        @Positive double totalAmount
) {}
