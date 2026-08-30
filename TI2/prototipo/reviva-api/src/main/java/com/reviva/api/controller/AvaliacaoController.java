package com.reviva.api.controller;

import com.reviva.api.dto.AvaliacaoRequest;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Cobre: Avaliação do Receptor e Avaliação do Doador. */
@RestController
@RequestMapping("/api/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    public Avaliacao avaliar(@RequestBody @Valid AvaliacaoRequest req, @AuthenticationPrincipal Usuario avaliador) {
        Agendamento agendamento = agendamentoRepository.findById(req.agendamentoId())
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado"));
        Usuario avaliado = usuarioRepository.findById(req.avaliadoId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return avaliacaoService.avaliar(agendamento, avaliador, avaliado, req.nota(), req.comentario());
    }
}
