package com.financial_control.financial_control.domain.card;

import java.util.List;
import java.util.Optional;

public interface CardInvoiceRepository {
    CardInvoice save(CardInvoice invoice);
    Optional<CardInvoice> findById(String id);
    List<CardInvoice> findAll();
    void deleteById(String id);
}
