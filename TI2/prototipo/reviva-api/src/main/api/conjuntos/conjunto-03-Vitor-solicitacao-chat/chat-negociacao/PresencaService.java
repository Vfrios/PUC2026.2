package com.reviva.api.service;

import com.reviva.api.dto.MensagemResponse;
import com.reviva.api.dto.PresencaEvent;
import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Presença online/offline no estilo WhatsApp. Um usuário está online enquanto
 * tiver ao menos uma sessão WebSocket ativa (várias abas = várias sessões).
 *
 * Ficar online também é o momento em que as mensagens pendentes chegam ao
 * "aparelho" do usuário: elas passam para entregue=true (2 checks cinza).
 */
@Service
@RequiredArgsConstructor
public class PresencaService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MensagemRepository mensagemRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    private final Map<String, String> usuarioPorSessao = new HashMap<>();

    public void conectar(String sessaoId, String usuarioId) {
        synchronized (usuarioPorSessao) {
            if (usuarioPorSessao.containsKey(sessaoId)) return;
            boolean jaEstavaOnline = usuarioPorSessao.containsValue(usuarioId);
            usuarioPorSessao.put(sessaoId, usuarioId);
            if (jaEstavaOnline) return;
        }
        messagingTemplate.convertAndSend("/topic/presence", new PresencaEvent(usuarioId, true));
        marcarPendentesComoEntregues(usuarioId);
    }

    public void desconectar(String sessaoId) {
        String usuarioId;
        synchronized (usuarioPorSessao) {
            usuarioId = usuarioPorSessao.remove(sessaoId);
            if (usuarioId == null || usuarioPorSessao.containsValue(usuarioId)) return;
        }
        messagingTemplate.convertAndSend("/topic/presence", new PresencaEvent(usuarioId, false));
    }

    public boolean estaOnline(String usuarioId) {
        synchronized (usuarioPorSessao) {
            return usuarioPorSessao.containsValue(usuarioId);
        }
    }

    public Set<String> online() {
        synchronized (usuarioPorSessao) {
            return new HashSet<>(usuarioPorSessao.values());
        }
    }

    private void marcarPendentesComoEntregues(String usuarioId) {
        Set<String> conversas = new HashSet<>();
        for (Solicitacao s : solicitacaoRepository.findByDoadorId(usuarioId)) conversas.add(s.getId());
        for (Solicitacao s : solicitacaoRepository.findByReceptor_Id(usuarioId)) conversas.add(s.getId());
        if (conversas.isEmpty()) return;

        List<Mensagem> pendentes = mensagemRepository.findBySolicitacao_IdInAndEntregueNot(conversas, true).stream()
                .filter(m -> m.getRemetente() != null && m.getSolicitacao() != null)
                .filter(m -> !usuarioId.equals(m.getRemetente().getId()))
                .toList();
        if (pendentes.isEmpty()) return;

        pendentes.forEach(m -> m.setEntregue(true));
        mensagemRepository.saveAll(pendentes);
        for (Mensagem m : pendentes) {
            messagingTemplate.convertAndSend("/topic/solicitacoes/" + m.getSolicitacao().getId(), MensagemResponse.from(m));
        }
    }
}
