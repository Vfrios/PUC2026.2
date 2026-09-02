package com.reviva.api.controller;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import com.reviva.api.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;
    private final NotificacaoRepository notificacaoRepository;

    @Value("${reviva.notificacoes.expiracao-dias:30}")
    private int expiracaoDias;

    @GetMapping
    public List<Notificacao> listar(@AuthenticationPrincipal Usuario usuario) {
        notificacaoService.excluirExpiradas(usuario, expiracaoDias);
        return notificacaoService.listar(usuario);
    }

    @PostMapping("/{id}/lida")
    public void marcarComoLida(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Notificacao n = notificacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada"));
        if (!n.getUsuario().getId().equals(usuario.getId())) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN);
        notificacaoService.marcarComoLida(n);
    }

    @DeleteMapping
    public void limpar(@AuthenticationPrincipal Usuario usuario) {
        notificacaoService.limpar(usuario);
    }

    @DeleteMapping("/expiradas")
    public void excluirExpiradas(@AuthenticationPrincipal Usuario usuario) {
        notificacaoService.excluirExpiradas(usuario, expiracaoDias);
    }
}
