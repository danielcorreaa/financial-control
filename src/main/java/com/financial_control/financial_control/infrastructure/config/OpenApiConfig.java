package com.financial_control.financial_control.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração da documentação OpenAPI / Swagger UI com suporte a Bearer JWT.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI financialControlOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Financial Control API")
                        .description("API REST para controle financeiro pessoal — gestão de meses, despesas, receitas, balanço e projetos extraordinários.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Financial Control")
                                .email("contato@financialcontrol.com")))
                // Define o esquema de segurança Bearer JWT
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Informe o token JWT obtido no endpoint /auth/login")))
                // Aplica o esquema globalmente a todos os endpoints
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}
