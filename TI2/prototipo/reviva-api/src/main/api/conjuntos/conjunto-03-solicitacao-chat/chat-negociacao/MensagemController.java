package com.reviva.api.controller;

import com.reviva.api.dto.MensagemRequest;
import com.reviva.api.model.Mensagem;
import com.reviva.api.dto.MensagemResponse;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * Cobre a tela de Chat (Doador <-> Receptor de uma Solicitação).
 * Envio/histórico seguem via REST (reaproveitando toda a validação de
 * acesso já existente); a mensagem salva é também publicada em
 * /topic/solicitacoes/{id} via WebSocket/STOMP, para chegar instantaneamente
 * em quem estiver com o chat aberto (ver WebSocketConfig).
 */
@RestController
@RequestMapping("/api/solicitacoes/{solicitacaoId}/mensagens")
@RequiredArgsConstructor
public class MensagemController {

    private final MensagemRepository mensagemRepository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public List<MensagemResponse> listar(@PathVariable String solicitacaoId, @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        List<Mensagem> mensagens = mensagemRepository.findBySolicitacaoOrderByCriadaEmAsc(solicitacao)
                .stream().filter(mensagem -> mensagem.getRemetente() != null).toList();
        // Abrir o chat = mensagem entregue + lida (checks azuis no WhatsApp).
        marcarRecebidas(solicitacaoId, mensagens, usuario, true);
        return MensagemResponse.from(mensagens);
    }

    /**
     * Confirma entrega/leitura das mensagens recebidas — chamado quando o
     * destinatário tem o chat aberto e recebe algo via WebSocket.
     */
    @PostMapping("/lidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarLidas(@PathVariable String solicitacaoId, @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        List<Mensagem> mensagens = mensagemRepository.findBySolicitacaoOrderByCriadaEmAsc(solicitacao)
                .stream().filter(mensagem -> mensagem.getRemetente() != null).toList();
        marcarRecebidas(solicitacaoId, mensagens, usuario, true);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemResponse enviar(@PathVariable String solicitacaoId, @RequestBody @Valid MensagemRequest req,
                                   @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        Mensagem mensagem = Mensagem.builder()
                .solicitacao(solicitacao)
                .remetente(usuario)
                .texto(req.texto())
                .entregue(false)
                .lida(false)
                .build();
        Mensagem salva = mensagemRepository.save(mensagem);
        MensagemResponse resposta = MensagemResponse.from(salva);
        messagingTemplate.convertAndSend("/topic/solicitacoes/" + solicitacaoId, resposta);
        return resposta;
    }

    /** Só o doador do item ou o receptor da solicitação podem ver/enviar mensagens dela. */
    private Solicitacao buscarEValidarAcesso(String solicitacaoId, Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findValidById(solicitacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        if (solicitacao.getItem() == null || solicitacao.getReceptor() == null) {
            throw new IllegalArgumentException("Esta conversa possui dados inválidos e não está disponível");
        }
        boolean ehDoador = solicitacao.getItem().getDoador().getId().equals(usuario.getId());
        boolean ehReceptor = solicitacao.getReceptor().getId().equals(usuario.getId());
        if (!ehDoador && !ehReceptor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta conversa");
        }
        return solicitacao;
    }

    private void marcarRecebidas(String solicitacaoId, List<Mensagem> mensagens, Usuario usuario, boolean comoLida) {
        List<Mensagem> atualizadas = new ArrayList<>();
        for (Mensagem mensagem : mensagens) {
            if (mensagem.getRemetente().getId().equals(usuario.getId())) continue;
            boolean mudou = false;
            if (!Boolean.TRUE.equals(mensagem.getEntregue())) {
                mensagem.setEntregue(true);
                mudou = true;
            }
            if (comoLida && !Boolean.TRUE.equals(mensagem.getLida())) {
                mensagem.setLida(true);
                mudou = true;
            }
            if (mudou) atualizadas.add(mensagem);
        }
        if (atualizadas.isEmpty()) return;
        mensagemRepository.saveAll(atualizadas);
        for (Mensagem mensagem : atualizadas) {
            messagingTemplate.convertAndSend("/topic/solicitacoes/" + solicitacaoId, MensagemResponse.from(mensagem));
        }
    }
}
