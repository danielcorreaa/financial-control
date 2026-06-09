package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.auth.AuthService;
import com.financial_control.financial_control.application.auth.dto.AuthResponse;
import com.financial_control.financial_control.application.auth.dto.LoginCommand;
import com.financial_control.financial_control.application.auth.dto.RegisterCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST para registro e login de usuários.
 * Rotas públicas — não requerem autenticação.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Registro e login de usuários")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria uma conta e retorna o token JWT")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(command));
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Valida credenciais e retorna o token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginCommand command) {
        return ResponseEntity.ok(authService.login(command));
    }
}
