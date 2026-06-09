package com.financial_control.financial_control.domain.user;

import java.util.Optional;

/**
 * Porta de repositório para a entidade User.
 */
public interface UserRepository {

    User save(User user);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
