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
    private String googleId;
    private Role role;

    // Construtor para criação de novo usuário (email/senha)
    public User(String name, String email, String passwordHash) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.googleId = null;
        this.role = Role.USER;
    }

    // Construtor para criação de usuário via Google OAuth
    public User(String name, String email, String googleId, boolean isGoogleUser) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.passwordHash = null;
        this.googleId = googleId;
        this.role = Role.USER;
    }

    // Construtor de reconstituição
    public User(String id, String name, String email, String passwordHash, String googleId, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.googleId = googleId;
        this.role = role;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updatePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void linkGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public void promoteToAdmin() {
        this.role = Role.ADMIN;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getGoogleId() { return googleId; }
    public Role getRole() { return role; }
}
