package com.financial_control.financial_control.infrastructure.persistence.salary;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MongoSalaryConfigRepository extends MongoRepository<SalaryConfigDocument, String> {
    Optional<SalaryConfigDocument> findByYear(int year);
    boolean existsByYear(int year);
}
