package com.financial_control.financial_control.infrastructure.persistence.card;

import com.financial_control.financial_control.application.invoice.dto.ParsedTransactionDTO;
import com.financial_control.financial_control.domain.card.CardBank;
import com.financial_control.financial_control.domain.card.CardInvoice;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<ParsedTransactionDTO> transactions;
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
        doc.transactions = invoice.getTransactions();
        doc.createdAt = invoice.getCreatedAt();
        return doc;
    }

    public CardInvoice toDomain() {
        return new CardInvoice(id, bank, cardName, dueDate, totalAmount,
                monthId, expenseId, transactions, createdAt);
    }
}
