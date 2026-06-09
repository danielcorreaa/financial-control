package com.financial_control.financial_control.infrastructure.persistence.user;

import com.financial_control.financial_control.domain.user.User;
import com.financial_control.financial_control.domain.user.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Implementação MongoDB do repositório de usuários.
 */
@Repository
public class UserRepositoryImpl implements UserRepository {

    private final MongoUserRepository mongoRepository;

    public UserRepositoryImpl(MongoUserRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public User save(User user) {
        return mongoRepository.save(UserDocument.from(user)).toDomain();
    }

    @Override
    public Optional<User> findById(String id) {
        return mongoRepository.findById(id).map(UserDocument::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return mongoRepository.findByEmail(email).map(UserDocument::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return mongoRepository.existsByEmail(email);
    }
}
