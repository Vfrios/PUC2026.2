package com.reviva.api.controller;

import com.reviva.api.model.Notificacao;
import com.reviva.api.dto.NotificacaoResponse;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import com.reviva.api.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    @Value("${reviva.notificacoes.expiracao-dias:30}")
    private int expiracaoDias;

    private final NotificacaoService notificacaoService;
    private final NotificacaoRepository notificacaoRepository;

    @GetMapping
    public List<NotificacaoResponse> listar(@AuthenticationPrincipal Usuario usuario,
                                            @RequestParam(defaultValue = "false") boolean todas) {
        // Padrão: só não lidas. Com ?todas=true inclui as já lidas (aba "Todas").
        return NotificacaoResponse.from(
                todas ? notificacaoService.listarRecentes(usuario) : notificacaoService.listarNaoLidas(usuario),
                notificacaoService.limiteExpiracao(expiracaoDias));
    }

    @PostMapping("/{id}/lida")
    public void marcarComoLida(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Notificacao n = notificacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada"));
        if (!n.getUsuario().getId().equals(usuario.getId())) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN);
        notificacaoService.marcarComoLida(n);
    }

}
