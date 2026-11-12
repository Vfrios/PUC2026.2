package com.reviva.api.controller;

import com.reviva.api.dto.TokenResponse;
import com.reviva.api.model.PreferenciasNotificacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/** Cobre: Segurança e termos (senha, preferências de notificação e sessões). */
@RestController
@RequestMapping("/api/usuarios/me")
@RequiredArgsConstructor
public class SegurancaController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public record AlterarSenhaRequest(
            @NotBlank String senhaAtual,
            @NotBlank @Size(min = 8, max = 72, message = "A nova senha deve ter pelo menos 8 caracteres") String novaSenha
    ) {}

    /** Troca a senha e encerra as sessões em outros dispositivos; devolve um token novo para este. */
    @PostMapping("/senha")
    public TokenResponse alterarSenha(@AuthenticationPrincipal Usuario usuario, @RequestBody @Valid AlterarSenhaRequest req) {
        if (!passwordEncoder.matches(req.senhaAtual(), usuario.getSenhaHash())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }
        if (req.senhaAtual().equals(req.novaSenha())) {
            throw new IllegalArgumentException("A nova senha precisa ser diferente da atual.");
        }
        if (!req.novaSenha().matches(".*[A-Za-z].*") || !req.novaSenha().matches(".*\\d.*")) {
            throw new IllegalArgumentException("Use letras e números na nova senha.");
        }
        usuario.setSenhaHash(passwordEncoder.encode(req.novaSenha()));
        usuario.setSenhaAlteradaEm(Instant.now());
        return revogarSessoesENovoToken(usuario);
    }

    @GetMapping("/preferencias")
    public PreferenciasNotificacao preferencias(@AuthenticationPrincipal Usuario usuario) {
        return usuario.getPreferencias();
    }

    @PutMapping("/preferencias")
    public PreferenciasNotificacao salvarPreferencias(@AuthenticationPrincipal Usuario usuario,
                                                      @RequestBody PreferenciasNotificacao preferencias) {
        usuario.setPreferencias(preferencias);
        return usuarioRepository.save(usuario).getPreferencias();
    }

    /** "Sair de todos os outros dispositivos": invalida tokens antigos e devolve um novo. */
    @PostMapping("/sessoes/encerrar")
    public TokenResponse encerrarOutrasSessoes(@AuthenticationPrincipal Usuario usuario) {
        return revogarSessoesENovoToken(usuario);
    }

    private TokenResponse revogarSessoesENovoToken(Usuario usuario) {
        // O "iat" do JWT tem precisão de segundos: truncar garante que o token novo continue válido.
        usuario.setSessoesRevogadasEm(Instant.now().truncatedTo(ChronoUnit.SECONDS));
        usuarioRepository.save(usuario);
        return TokenResponse.of(jwtService.gerarToken(usuario.getId(), usuario.getEmail()));
    }
}
