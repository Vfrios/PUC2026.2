package com.reviva.api.controller;

import com.reviva.api.dto.LoginRequest;
import com.reviva.api.dto.RecuperarSenhaRequest;
import com.reviva.api.dto.RegistroRequest;
import com.reviva.api.dto.TokenResponse;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

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
        String email = normalizarEmail(req.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        String documento = somenteDigitos(req.cpf());
        String telefone = somenteDigitos(req.telefone() != null ? req.telefone() : req.celular());
        String cep = somenteDigitos(req.cep());
        String logradouro = normalizarTexto(req.rua() != null ? req.rua() : req.logradouro());
        String bairro = normalizarTexto(req.bairro());
        String cidade = normalizarTexto(req.cidade());
        String uf = normalizarTexto(req.uf()).toUpperCase();

        if (!documentoValido(documento)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF/CNPJ invalido");
        }
        if (telefone.length() != 10 && telefone.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Celular invalido");
        }
        if (!cep.isEmpty() && cep.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP invalido");
        }
        boolean enderecoManualValido = (!cep.isEmpty()) || (!logradouro.isEmpty() && !bairro.isEmpty() && !cidade.isEmpty() && !uf.isEmpty());
        if (!enderecoManualValido) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o CEP ou preencha rua, bairro, cidade e UF manualmente");
        }
        if (req.tipoPessoa() == null || req.tipoPessoa().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tipoPessoa nao pode estar em branco");
        }
        if (usuarioRepository.existsByCpf(documento)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF/CNPJ ja cadastrado");
        }
        Usuario usuario = Usuario.builder()
                .nome(req.nome())
                .email(email)
                .cpf(documento)
                .telefone(telefone)
                .cep(cep)
                .logradouro(logradouro)
                .bairro(bairro)
                .cidade(cidade)
                .uf(uf)
                .numero(req.numero())
                .complemento(req.complemento())
                .senhaHash(passwordEncoder.encode(req.senha()))
                .build();
        try {
            usuario = usuarioRepository.save(usuario);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ou CPF ja cadastrado");
        }
        return TokenResponse.of(jwtService.gerarToken(usuario.getId(), usuario.getEmail()));
    }

    @PostMapping("/login")
    public TokenResponse login(@RequestBody @Valid LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(normalizarEmail(req.email()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
        if (!passwordEncoder.matches(req.senha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }
        return TokenResponse.of(jwtService.gerarToken(usuario.getId(), usuario.getEmail()));
    }

    /**
     * Esqueceu a senha sem SMTP: confere e-mail + CPF/CNPJ e grava a nova senha.
     * Mensagem genérica evita revelar se o e-mail existe.
     */
    @PostMapping("/recuperar-senha")
    public Map<String, String> recuperarSenha(@RequestBody @Valid RecuperarSenhaRequest req) {
        String email = normalizarEmail(req.email());
        String documento = somenteDigitos(req.cpf());
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null || usuario.getCpf() == null || !usuario.getCpf().equals(documento)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail ou CPF/CNPJ não conferem.");
        }
        if (!req.novaSenha().matches(".*[A-Za-z].*") || !req.novaSenha().matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use letras e números na nova senha.");
        }
        if (passwordEncoder.matches(req.novaSenha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nova senha precisa ser diferente da atual.");
        }
        Instant agora = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        usuario.setSenhaHash(passwordEncoder.encode(req.novaSenha()));
        usuario.setSenhaAlteradaEm(agora);
        usuario.setSessoesRevogadasEm(agora);
        usuarioRepository.save(usuario);
        return Map.of("mensagem", "Senha redefinida. Entre com a nova senha.");
    }

    private static String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    private static String normalizarEmail(String valor) {
        return valor == null ? "" : valor.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private static String normalizarTexto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private static boolean documentoValido(String documento) {
        if (documento == null) return false;
        if (documento.length() == 11) return cpfValido(documento);
        if (documento.length() == 14) return cnpjValido(documento);
        return false;
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

    private static boolean cnpjValido(String cnpj) {
        if (cnpj == null || cnpj.length() != 14 || cnpj.chars().distinct().count() == 1) return false;

        int[] pesosPrimeiro = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] pesosSegundo = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.digit(cnpj.charAt(i), 10) * pesosPrimeiro[i];
        }
        int digito1 = soma % 11;
        digito1 = digito1 < 2 ? 0 : 11 - digito1;
        if (digito1 != Character.digit(cnpj.charAt(12), 10)) return false;

        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.digit(cnpj.charAt(i), 10) * pesosSegundo[i];
        }
        int digito2 = soma % 11;
        digito2 = digito2 < 2 ? 0 : 11 - digito2;
        return digito2 == Character.digit(cnpj.charAt(13), 10);
    }
}
