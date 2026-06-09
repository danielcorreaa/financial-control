package com.financial_control.financial_control.application.auth;

import com.financial_control.financial_control.application.auth.dto.AuthResponse;
import com.financial_control.financial_control.application.auth.dto.LoginCommand;
import com.financial_control.financial_control.application.auth.dto.RegisterCommand;
import com.financial_control.financial_control.domain.user.User;
import com.financial_control.financial_control.domain.user.UserRepository;
import com.financial_control.financial_control.infrastructure.exception.DuplicateResourceException;
import com.financial_control.financial_control.infrastructure.exception.ResourceNotFoundException;
import com.financial_control.financial_control.infrastructure.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Serviço de aplicação para autenticação e registro de usuários.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Registra um novo usuário e retorna o token JWT gerado.
     */
    public AuthResponse register(RegisterCommand command) {
        if (userRepository.existsByEmail(command.email())) {
            throw new DuplicateResourceException("E-mail já cadastrado: " + command.email());
        }

        User user = new User(
                command.name(),
                command.email(),
                passwordEncoder.encode(command.password())
        );

        User saved = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    /**
     * Autentica o usuário com email e senha, retornando o token JWT.
     */
    public AuthResponse login(LoginCommand command) {
        // Delega a validação de credenciais ao Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(command.email(), command.password())
        );

        User user = userRepository.findByEmail(command.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
