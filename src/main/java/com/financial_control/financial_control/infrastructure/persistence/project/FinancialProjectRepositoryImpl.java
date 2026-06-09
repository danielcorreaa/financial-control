package com.financial_control.financial_control.infrastructure.persistence.project;

import com.financial_control.financial_control.domain.project.FinancialProject;
import com.financial_control.financial_control.domain.project.FinancialProjectRepository;
import com.financial_control.financial_control.domain.project.ProjectStatus;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Implementação MongoDB do repositório de FinancialProject.
 */
@Repository
public class FinancialProjectRepositoryImpl implements FinancialProjectRepository {

    private final MongoFinancialProjectRepository mongoRepository;

    public FinancialProjectRepositoryImpl(MongoFinancialProjectRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public FinancialProject save(FinancialProject project) {
        FinancialProjectDocument document = FinancialProjectDocument.from(project);
        return mongoRepository.save(document).toDomain();
    }

    @Override
    public Optional<FinancialProject> findById(String id) {
        return mongoRepository.findById(id).map(FinancialProjectDocument::toDomain);
    }

    @Override
    public List<FinancialProject> findAll() {
        return mongoRepository.findAll().stream()
                .map(FinancialProjectDocument::toDomain)
                .toList();
    }

    @Override
    public List<FinancialProject> findByStatus(ProjectStatus status) {
        return mongoRepository.findByStatus(status).stream()
                .map(FinancialProjectDocument::toDomain)
                .toList();
    }

    @Override
    public void deleteById(String id) {
        mongoRepository.deleteById(id);
    }
}
