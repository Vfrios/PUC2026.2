package com.reviva.api.controller;

import com.reviva.api.dto.MensagemRequest;
import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Cobre a tela de Chat (Doador <-> Receptor de uma Solicitação).
 * Implementado via REST simples (o front busca em intervalos curtos);
 * ver README para o caminho de evolução para WebSocket/STOMP em tempo real.
 */
@RestController
@RequestMapping("/api/solicitacoes/{solicitacaoId}/mensagens")
@RequiredArgsConstructor
public class MensagemController {

    private final MensagemRepository mensagemRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    @GetMapping
    public List<Mensagem> listar(@PathVariable String solicitacaoId, @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        return mensagemRepository.findBySolicitacaoOrderByCriadaEmAsc(solicitacao);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mensagem enviar(@PathVariable String solicitacaoId, @RequestBody @Valid MensagemRequest req,
                            @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        Mensagem mensagem = Mensagem.builder()
                .solicitacao(solicitacao)
                .remetente(usuario)
                .texto(req.texto())
                .build();
        return mensagemRepository.save(mensagem);
    }

    /** Só o doador do item ou o receptor da solicitação podem ver/enviar mensagens dela. */
    private Solicitacao buscarEValidarAcesso(String solicitacaoId, Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        boolean ehDoador = solicitacao.getItem().getDoador().getId().equals(usuario.getId());
        boolean ehReceptor = solicitacao.getReceptor().getId().equals(usuario.getId());
        if (!ehDoador && !ehReceptor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta conversa");
        }
        return solicitacao;
    }
}
