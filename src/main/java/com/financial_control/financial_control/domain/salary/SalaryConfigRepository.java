package com.financial_control.financial_control.domain.salary;

import java.util.List;
import java.util.Optional;

/**
 * Porta de repositório para SalaryConfig.
 */
public interface SalaryConfigRepository {
    SalaryConfig save(SalaryConfig config);
    Optional<SalaryConfig> findById(String id);
    Optional<SalaryConfig> findByYear(int year);
    List<SalaryConfig> findAll();
    boolean existsByYear(int year);
    void deleteById(String id);
}
