package com.reviva.api.service;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo) {
        Notificacao n = Notificacao.builder().usuario(usuario).titulo(titulo).tipo(tipo).build();
        return notificacaoRepository.save(n);
    }

    /**
     * Para CHAT: no máximo uma notificação não lida por conversa.
     * Assim a tela de Notificações não vira histórico de mensagens —
     * o histórico fica no Inbox/Mensagens.
     */
    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo, Solicitacao solicitacao) {
        if (tipo == Notificacao.Tipo.CHAT && solicitacao != null && usuario != null) {
            List<Notificacao> pendentes = notificacaoRepository
                    .findByUsuario_IdAndSolicitacao_IdAndLidaFalse(usuario.getId(), solicitacao.getId());
            if (!pendentes.isEmpty()) {
                Notificacao principal = pendentes.get(0);
                principal.setTitulo(titulo);
                principal.setCriadaEm(Instant.now());
                principal.setLida(false);
                for (int i = 1; i < pendentes.size(); i++) {
                    pendentes.get(i).setLida(true);
                }
                notificacaoRepository.saveAll(pendentes);
                return principal;
            }
        }

        Notificacao n = Notificacao.builder()
                .usuario(usuario).titulo(titulo).tipo(tipo).solicitacao(solicitacao).build();
        return notificacaoRepository.save(n);
    }

    /** Lista completa (uso interno / limpeza). */
    public List<Notificacao> listar(Usuario usuario) {
        return notificacaoRepository.findByUsuarioOrderByCriadaEmDesc(usuario);
    }

    /** Tela de Notificações: só o que ainda não foi lido. Contatos ficam no Inbox/Mensagens. */
    public List<Notificacao> listarNaoLidas(Usuario usuario) {
        return notificacaoRepository.findByUsuario_IdAndLidaFalseOrderByCriadaEmDesc(usuario.getId());
    }

    public Instant limiteExpiracao(int dias) {
        return Instant.now().minus(Math.max(1, dias), ChronoUnit.DAYS);
    }

    @Transactional
    public long limpar(Usuario usuario) {
        return notificacaoRepository.deleteByUsuario_Id(usuario.getId());
    }

    /** Marca todas as não lidas como lidas (somem da tela de Notificações). */
    @Transactional
    public long marcarTodasComoLidas(Usuario usuario) {
        List<Notificacao> pendentes = listarNaoLidas(usuario);
        for (Notificacao n : pendentes) {
            n.setLida(true);
        }
        if (!pendentes.isEmpty()) notificacaoRepository.saveAll(pendentes);
        return pendentes.size();
    }

    @Transactional
    public long excluirExpiradas(Usuario usuario, int dias) {
        return notificacaoRepository.deleteByUsuario_IdAndCriadaEmBefore(usuario.getId(), limiteExpiracao(dias));
    }

    public void marcarComoLida(Notificacao notificacao) {
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }

    /** Ao abrir o chat, as notificações CHAT daquela conversa saem da tela de Notificações. */
    @Transactional
    public void marcarChatComoLido(Usuario usuario, Solicitacao solicitacao) {
        if (usuario == null || solicitacao == null) return;
        List<Notificacao> pendentes = notificacaoRepository
                .findByUsuario_IdAndSolicitacao_IdAndLidaFalse(usuario.getId(), solicitacao.getId());
        for (Notificacao n : pendentes) {
            n.setLida(true);
        }
        if (!pendentes.isEmpty()) notificacaoRepository.saveAll(pendentes);
    }
}
