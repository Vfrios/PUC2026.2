package com.reviva.api.config;

import com.reviva.api.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Rotas liberadas para qualquer método (login/registro, docs, console do H2).
    private static final String[] ROTAS_PUBLICAS = {
            "/api/auth/**",
            "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**",
            "/v3/api-docs.yaml", "/webjars/**",
            "/ws/**", // handshake do chat em tempo real; autenticado via JwtHandshakeInterceptor
            // Frontend estático (servido pelo próprio Spring Boot a partir daqui em diante)
            "/", "/index.html", "/assets/**", "/favicon.ico", "/*.svg", "/*.png", "/*.ico"
    };

    // Rotas liberadas apenas para LEITURA (GET) sem login — navegar/buscar itens
    // e comunidades não exige conta, mas publicar/editar/entrar exige.
    private static final String[] ROTAS_PUBLICAS_LEITURA = {
            "/api/itens", "/api/itens/*", "/api/usuarios/*/itens", "/api/comunidades", "/api/geo/**"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(ROTAS_PUBLICAS).permitAll()
                    .requestMatchers(HttpMethod.GET, ROTAS_PUBLICAS_LEITURA).permitAll()
                    .anyRequest().authenticated())
            .headers(h -> h.frameOptions(f -> f.sameOrigin())) // necessário para o console do H2
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
