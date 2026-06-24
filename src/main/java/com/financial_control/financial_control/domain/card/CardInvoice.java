package com.financial_control.financial_control.domain.card;

import com.financial_control.financial_control.application.invoice.dto.ParsedTransactionDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CardInvoice {

    private final String id;
    private CardBank bank;
    private String cardName;
    private LocalDate dueDate;
    private double totalAmount;
    private String monthId;
    private String expenseId;
    private List<ParsedTransactionDTO> transactions;
    private final LocalDateTime createdAt;

    public CardInvoice(CardBank bank, String cardName, LocalDate dueDate,
                       double totalAmount, String monthId, String expenseId,
                       List<ParsedTransactionDTO> transactions) {
        this.id = UUID.randomUUID().toString();
        this.bank = bank;
        this.cardName = cardName;
        this.dueDate = dueDate;
        this.totalAmount = totalAmount;
        this.monthId = monthId;
        this.expenseId = expenseId;
        this.transactions = transactions != null ? transactions : List.of();
        this.createdAt = LocalDateTime.now();
    }

    public CardInvoice(String id, CardBank bank, String cardName, LocalDate dueDate,
                       double totalAmount, String monthId, String expenseId,
                       List<ParsedTransactionDTO> transactions, LocalDateTime createdAt) {
        this.id = id;
        this.bank = bank;
        this.cardName = cardName;
        this.dueDate = dueDate;
        this.totalAmount = totalAmount;
        this.monthId = monthId;
        this.expenseId = expenseId;
        this.transactions = transactions != null ? transactions : List.of();
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public CardBank getBank() { return bank; }
    public String getCardName() { return cardName; }
    public LocalDate getDueDate() { return dueDate; }
    public double getTotalAmount() { return totalAmount; }
    public String getMonthId() { return monthId; }
    public String getExpenseId() { return expenseId; }
    public List<ParsedTransactionDTO> getTransactions() { return transactions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
