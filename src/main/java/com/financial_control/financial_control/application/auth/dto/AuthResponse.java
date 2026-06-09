package com.financial_control.financial_control.application.auth.dto;

import com.financial_control.financial_control.domain.user.Role;

/**
 * Resposta retornada após registro ou login bem-sucedido.
 */
public record AuthResponse(
        String token,
        String id,
        String name,
        String email,
        Role role
) {}
