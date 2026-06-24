package com.financial_control.financial_control.application.card;

import com.financial_control.financial_control.application.card.dto.CardInvoiceResponse;
import com.financial_control.financial_control.application.card.dto.CreateCardInvoiceCommand;
import com.financial_control.financial_control.domain.card.CardInvoice;
import com.financial_control.financial_control.domain.card.CardInvoiceRepository;
import com.financial_control.financial_control.domain.expense.Expense;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.FinancialMonthRepository;
import com.financial_control.financial_control.infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Month;
import java.util.List;

@Service
public class CardInvoiceService {

    private final CardInvoiceRepository invoiceRepository;
    private final FinancialMonthRepository monthRepository;

    public CardInvoiceService(CardInvoiceRepository invoiceRepository,
                              FinancialMonthRepository monthRepository) {
        this.invoiceRepository = invoiceRepository;
        this.monthRepository = monthRepository;
    }

    public CardInvoiceResponse add(CreateCardInvoiceCommand command) {
        Month month = command.dueDate().getMonth();
        int year = command.dueDate().getYear();

        FinancialMonth financialMonth = monthRepository
                .findByMonthAndYear(month, year)
                .orElseGet(() -> {
                    FinancialMonth newMonth = new FinancialMonth(month, year, null);
                    return monthRepository.save(newMonth);
                });

        String name = buildExpenseName(command);
        Expense expense = financialMonth.addExpense(
                name,
                ExpenseCategory.CARTAO_CREDITO,
                BigDecimal.valueOf(command.totalAmount()),
                command.dueDate(),
                null
        );
        monthRepository.save(financialMonth);

        CardInvoice invoice = new CardInvoice(
                command.bank(), command.cardName(), command.dueDate(),
                command.totalAmount(), financialMonth.getId(), expense.getId(),
                command.transactions()
        );
        return CardInvoiceResponse.from(invoiceRepository.save(invoice));
    }

    public List<CardInvoiceResponse> findAll() {
        return invoiceRepository.findAll().stream()
                .map(CardInvoiceResponse::from)
                .sorted((a, b) -> b.dueDate().compareTo(a.dueDate()))
                .toList();
    }

    public void delete(String id) {
        CardInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura nao encontrada: " + id));

        monthRepository.findById(invoice.getMonthId()).ifPresent(m -> {
            try {
                m.removeExpense(invoice.getExpenseId());
                monthRepository.save(m);
            } catch (Exception ignored) {
                // expense may have been manually removed already
            }
        });

        invoiceRepository.deleteById(id);
    }

    private String buildExpenseName(CreateCardInvoiceCommand command) {
        String bankLabel = command.bank().getLabel();
        String card = (command.cardName() != null && !command.cardName().isBlank())
                ? " - " + command.cardName()
                : "";
        return "Fatura " + bankLabel + card;
    }
}
