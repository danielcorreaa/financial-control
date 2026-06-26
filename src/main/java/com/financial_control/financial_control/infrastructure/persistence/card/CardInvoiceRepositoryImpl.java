package com.financial_control.financial_control.infrastructure.persistence.card;

import com.financial_control.financial_control.domain.card.CardInvoice;
import com.financial_control.financial_control.domain.card.CardInvoiceRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CardInvoiceRepositoryImpl implements CardInvoiceRepository {

    private final MongoCardInvoiceRepository mongo;

    public CardInvoiceRepositoryImpl(MongoCardInvoiceRepository mongo) {
        this.mongo = mongo;
    }

    @Override
    public CardInvoice save(CardInvoice invoice) {
        return mongo.save(CardInvoiceDocument.from(invoice)).toDomain();
    }

    @Override
    public Optional<CardInvoice> findById(String id) {
        return mongo.findById(id).map(CardInvoiceDocument::toDomain);
    }

    @Override
    public List<CardInvoice> findAll() {
        return mongo.findAll().stream().map(CardInvoiceDocument::toDomain).toList();
    }

    @Override
    public void deleteById(String id) {
        mongo.deleteById(id);
    }

    @Override
    public void deleteByMonthId(String monthId) {
        mongo.deleteByMonthId(monthId);
    }
}
