package com.financial_control.financial_control.infrastructure.persistence.month;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Month;
import java.util.List;
import java.util.Optional;

/**
 * Repositório Spring Data MongoDB para FinancialMonthDocument.
 */
public interface MongoFinancialMonthRepository extends MongoRepository<FinancialMonthDocument, String> {

    Optional<FinancialMonthDocument> findByMonthAndYear(Month month, int year);

    List<FinancialMonthDocument> findByYear(int year);

    boolean existsByMonthAndYear(Month month, int year);
}
