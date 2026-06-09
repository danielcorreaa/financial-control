package com.financial_control.financial_control.domain.project;

import java.util.List;
import java.util.Optional;

/**
 * Porta de repositório para o agregado FinancialProject.
 */
public interface FinancialProjectRepository {

    FinancialProject save(FinancialProject project);

    Optional<FinancialProject> findById(String id);

    List<FinancialProject> findAll();

    List<FinancialProject> findByStatus(ProjectStatus status);

    void deleteById(String id);
}
