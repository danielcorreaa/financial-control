package com.financial_control.financial_control.infrastructure.persistence.salary;

import com.financial_control.financial_control.domain.salary.SalaryConfig;
import com.financial_control.financial_control.domain.salary.SalaryConfigRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SalaryConfigRepositoryImpl implements SalaryConfigRepository {

    private final MongoSalaryConfigRepository mongo;

    public SalaryConfigRepositoryImpl(MongoSalaryConfigRepository mongo) {
        this.mongo = mongo;
    }

    @Override
    public SalaryConfig save(SalaryConfig config) {
        return mongo.save(SalaryConfigDocument.from(config)).toDomain();
    }

    @Override
    public Optional<SalaryConfig> findById(String id) {
        return mongo.findById(id).map(SalaryConfigDocument::toDomain);
    }

    @Override
    public Optional<SalaryConfig> findByYear(int year) {
        return mongo.findByYear(year).map(SalaryConfigDocument::toDomain);
    }

    @Override
    public List<SalaryConfig> findAll() {
        return mongo.findAll().stream().map(SalaryConfigDocument::toDomain).toList();
    }

    @Override
    public boolean existsByYear(int year) {
        return mongo.existsByYear(year);
    }

    @Override
    public void deleteById(String id) {
        mongo.deleteById(id);
    }
}
