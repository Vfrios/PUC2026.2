package com.reviva.api.controller;

import com.reviva.api.dto.AvaliacaoRequest;
import com.reviva.api.dto.AvaliacaoResponse;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Cobre: Avaliação do Receptor e Avaliação do Doador. */
@RestController
@RequestMapping("/api/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoResponse avaliar(@RequestBody @Valid AvaliacaoRequest req, @AuthenticationPrincipal Usuario avaliador) {
        Agendamento agendamento = agendamentoRepository.findById(req.agendamentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));
        Usuario avaliado = usuarioRepository.findById(req.avaliadoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        return AvaliacaoResponse.from(avaliacaoService.avaliar(agendamento, avaliador, avaliado, req));
    }

    /** Permite ao app saber se o usuário já avaliou a troca (evita avaliação duplicada). */
    @GetMapping("/agendamento/{agendamentoId}/minha")
    public AvaliacaoResponse minha(@PathVariable String agendamentoId, @AuthenticationPrincipal Usuario usuario) {
        return avaliacaoService.minhaAvaliacao(agendamentoId, usuario)
                .map(AvaliacaoResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma avaliação sua para esta troca"));
    }
}
