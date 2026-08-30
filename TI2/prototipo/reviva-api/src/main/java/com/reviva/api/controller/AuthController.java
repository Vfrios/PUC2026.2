package com.reviva.api.controller;

import com.reviva.api.dto.LoginRequest;
import com.reviva.api.dto.RegistroRequest;
import com.reviva.api.dto.TokenResponse;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Cobre a tela de Cadastro / Login. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/registrar")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenResponse registrar(@RequestBody @Valid RegistroRequest req) {
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        Usuario usuario = Usuario.builder()
                .nome(req.nome())
                .email(req.email())
                .senhaHash(passwordEncoder.encode(req.senha()))
                .build();
        usuario = usuarioRepository.save(usuario);
        return TokenResponse.of(jwtService.gerarToken(usuario.getId(), usuario.getEmail()));
    }

    @PostMapping("/login")
    public TokenResponse login(@RequestBody @Valid LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
        if (!passwordEncoder.matches(req.senha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }
        return TokenResponse.of(jwtService.gerarToken(usuario.getId(), usuario.getEmail()));
    }
}
