package com.financial_control.financial_control.domain.user;

import java.util.UUID;

/**
 * Entidade de domínio representando um usuário autenticável da aplicação.
 */
public class User {

    private final String id;
    private String name;
    private final String email;
    private String passwordHash;
    private Role role;

    // Construtor para criação de novo usuário
    public User(String name, String email, String passwordHash) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = Role.USER;
    }

    // Construtor de reconstituição
    public User(String id, String name, String email, String passwordHash, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updatePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void promoteToAdmin() {
        this.role = Role.ADMIN;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
}
