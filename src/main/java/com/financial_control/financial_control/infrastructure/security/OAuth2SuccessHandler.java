package com.financial_control.financial_control.infrastructure.security;

import com.financial_control.financial_control.domain.user.User;
import com.financial_control.financial_control.domain.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Intercepta o callback bem-sucedido do Google OAuth2.
 * Encontra ou cria o usuário no banco, gera um JWT e redireciona para o frontend.
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public OAuth2SuccessHandler(UserRepository userRepository,
                                JwtService jwtService,
                                UserDetailsService userDetailsService) {
        this.userRepository    = userRepository;
        this.jwtService        = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String googleId = oAuth2User.getAttribute("sub");   // ID único e estável do Google
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");

        if (email == null || googleId == null) {
            getRedirectStrategy().sendRedirect(request, response,
                    frontendUrl + "/login?error=google_missing_info");
            return;
        }

        // 1. Busca por googleId; 2. Busca por email (vincula conta); 3. Cria novo
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.linkGoogleId(googleId);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            User novo = new User(name, email, googleId, true);
                            return userRepository.save(novo);
                        }));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/auth/callback")
                .queryParam("token", token)
                .queryParam("id",    user.getId())
                .queryParam("name",  URLEncoder.encode(user.getName(), StandardCharsets.UTF_8))
                .queryParam("email", user.getEmail())
                .queryParam("role",  user.getRole().name())
                .build(true)
                .toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
