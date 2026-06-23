package com.financial_control.financial_control.infrastructure.persistence.card;

import com.financial_control.financial_control.domain.card.CardBank;
import com.financial_control.financial_control.domain.card.CardInvoice;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "card_invoices")
public class CardInvoiceDocument {

    @Id
    private String id;
    private CardBank bank;
    private String cardName;
    private LocalDate dueDate;
    private double totalAmount;
    private String monthId;
    private String expenseId;
    private LocalDateTime createdAt;

    public CardInvoiceDocument() {}

    public static CardInvoiceDocument from(CardInvoice invoice) {
        CardInvoiceDocument doc = new CardInvoiceDocument();
        doc.id = invoice.getId();
        doc.bank = invoice.getBank();
        doc.cardName = invoice.getCardName();
        doc.dueDate = invoice.getDueDate();
        doc.totalAmount = invoice.getTotalAmount();
        doc.monthId = invoice.getMonthId();
        doc.expenseId = invoice.getExpenseId();
        doc.createdAt = invoice.getCreatedAt();
        return doc;
    }

    public CardInvoice toDomain() {
        return new CardInvoice(id, bank, cardName, dueDate, totalAmount, monthId, expenseId, createdAt);
    }

    public String getId() { return id; }
    public CardBank getBank() { return bank; }
    public String getCardName() { return cardName; }
    public LocalDate getDueDate() { return dueDate; }
    public double getTotalAmount() { return totalAmount; }
    public String getMonthId() { return monthId; }
    public String getExpenseId() { return expenseId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
