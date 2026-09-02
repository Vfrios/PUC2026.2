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
        String cpf = somenteDigitos(req.cpf());
        String cep = somenteDigitos(req.cep());
        if (!cpfValido(cpf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF invalido");
        }
        if (cep.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP invalido");
        }
        if (usuarioRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF ja cadastrado");
        }
        Usuario usuario = Usuario.builder()
                .nome(req.nome())
                .email(req.email())
                .cpf(cpf)
                .cep(cep)
                .numero(req.numero())
                .complemento(req.complemento())
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

    private static String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    private static boolean cpfValido(String cpf) {
        if (cpf == null || cpf.length() != 11 || cpf.chars().distinct().count() == 1) return false;

        int soma = 0;
        for (int i = 0; i < 9; i++) soma += Character.digit(cpf.charAt(i), 10) * (10 - i);
        int digito1 = 11 - (soma % 11);
        if (digito1 >= 10) digito1 = 0;
        if (digito1 != Character.digit(cpf.charAt(9), 10)) return false;

        soma = 0;
        for (int i = 0; i < 10; i++) soma += Character.digit(cpf.charAt(i), 10) * (11 - i);
        int digito2 = 11 - (soma % 11);
        if (digito2 >= 10) digito2 = 0;
        return digito2 == Character.digit(cpf.charAt(10), 10);
    }
}
