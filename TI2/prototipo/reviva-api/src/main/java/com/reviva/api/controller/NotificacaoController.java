package com.reviva.api.controller;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import com.reviva.api.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;
    private final NotificacaoRepository notificacaoRepository;

    @GetMapping
    public List<Notificacao> listar(@AuthenticationPrincipal Usuario usuario) {
        return notificacaoService.listar(usuario);
    }

    @PostMapping("/{id}/lida")
    public void marcarComoLida(@PathVariable String id) {
        Notificacao n = notificacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada"));
        notificacaoService.marcarComoLida(n);
    }
}
