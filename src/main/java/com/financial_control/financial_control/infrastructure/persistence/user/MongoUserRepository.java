package com.financial_control.financial_control.infrastructure.persistence.user;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repositório Spring Data MongoDB para UserDocument.
 */
public interface MongoUserRepository extends MongoRepository<UserDocument, String> {

    Optional<UserDocument> findByEmail(String email);

    boolean existsByEmail(String email);
}
