package com.financial_control.financial_control.infrastructure.persistence.card;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoCardInvoiceRepository extends MongoRepository<CardInvoiceDocument, String> {
}
