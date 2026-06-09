package com.financial_control.financial_control.domain.month;

import java.time.Month;
import java.util.List;
import java.util.Optional;

/**
 * Porta de repositório para o agregado FinancialMonth.
 * Definida no domínio, implementada na infraestrutura.
 */
public interface FinancialMonthRepository {

    FinancialMonth save(FinancialMonth financialMonth);

    Optional<FinancialMonth> findById(String id);

    Optional<FinancialMonth> findByMonthAndYear(Month month, int year);

    List<FinancialMonth> findByYear(int year);

    List<FinancialMonth> findAll();

    boolean existsByMonthAndYear(Month month, int year);

    void deleteById(String id);
}
