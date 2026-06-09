package com.financial_control.financial_control.infrastructure.persistence.month;

import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.FinancialMonthRepository;
import org.springframework.stereotype.Repository;

import java.time.Month;
import java.util.List;
import java.util.Optional;

/**
 * Implementação MongoDB do repositório de FinancialMonth.
 * Realiza a tradução entre o modelo de domínio e o documento MongoDB.
 */
@Repository
public class FinancialMonthRepositoryImpl implements FinancialMonthRepository {

    private final MongoFinancialMonthRepository mongoRepository;

    public FinancialMonthRepositoryImpl(MongoFinancialMonthRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public FinancialMonth save(FinancialMonth financialMonth) {
        FinancialMonthDocument document = FinancialMonthDocument.from(financialMonth);
        return mongoRepository.save(document).toDomain();
    }

    @Override
    public Optional<FinancialMonth> findById(String id) {
        return mongoRepository.findById(id).map(FinancialMonthDocument::toDomain);
    }

    @Override
    public Optional<FinancialMonth> findByMonthAndYear(Month month, int year) {
        return mongoRepository.findByMonthAndYear(month, year)
                .map(FinancialMonthDocument::toDomain);
    }

    @Override
    public List<FinancialMonth> findByYear(int year) {
        return mongoRepository.findByYear(year).stream()
                .map(FinancialMonthDocument::toDomain)
                .toList();
    }

    @Override
    public List<FinancialMonth> findAll() {
        return mongoRepository.findAll().stream()
                .map(FinancialMonthDocument::toDomain)
                .toList();
    }

    @Override
    public boolean existsByMonthAndYear(Month month, int year) {
        return mongoRepository.existsByMonthAndYear(month, year);
    }

    @Override
    public void deleteById(String id) {
        mongoRepository.deleteById(id);
    }
}
