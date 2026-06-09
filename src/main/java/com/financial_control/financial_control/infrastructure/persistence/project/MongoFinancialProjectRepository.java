package com.financial_control.financial_control.infrastructure.persistence.project;

import com.financial_control.financial_control.domain.project.ProjectStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Repositório Spring Data MongoDB para FinancialProjectDocument.
 */
public interface MongoFinancialProjectRepository extends MongoRepository<FinancialProjectDocument, String> {

    List<FinancialProjectDocument> findByStatus(ProjectStatus status);
}
