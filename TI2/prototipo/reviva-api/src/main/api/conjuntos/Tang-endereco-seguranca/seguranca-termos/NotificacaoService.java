package com.reviva.api.service;

import com.reviva.api.config.CarregadorEmLote;
import com.reviva.api.config.DbRefCache;
import org.bson.Document;
import org.bson.types.ObjectId;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final MongoTemplate mongoTemplate;
    private final CarregadorEmLote carregadorEmLote;

    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo) {
        if (!permite(usuario, tipo)) return null;
        Notificacao n = Notificacao.builder().usuario(usuario).titulo(titulo).tipo(tipo).build();
        return notificacaoRepository.save(n);
    }

    /** Respeita as preferências de notificação da conta (tela Segurança e termos). */
    private boolean permite(Usuario usuario, Notificacao.Tipo tipo) {
        return usuario == null || usuario.getPreferencias().permite(tipo);
    }

    /**
     * Para CHAT: no máximo uma notificação não lida por conversa.
     * Assim a tela de Notificações não vira histórico de mensagens —
     * o histórico fica no Inbox/Mensagens.
     */
    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo, Solicitacao solicitacao) {
        if (!permite(usuario, tipo)) return null;
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
        return carregadorEmLote.buscar(filtroDoUsuario(usuario).append("lida", false), new Document("criadaEm", -1), 0, Notificacao.class);
    }

    private static Document filtroDoUsuario(Usuario usuario) {
        List<Object> ids = new java.util.ArrayList<>(List.of(usuario.getId()));
        if (ObjectId.isValid(usuario.getId())) ids.add(new ObjectId(usuario.getId()));
        return new Document("usuario.$id", new Document("$in", ids));
    }

    /** Aba "Todas": lidas e não lidas mais recentes. */
    public List<Notificacao> listarRecentes(Usuario usuario) {
        return carregadorEmLote.buscar(filtroDoUsuario(usuario), new Document("criadaEm", -1), 50, Notificacao.class);
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
        return marcarLidasEmLote(listarNaoLidas(usuario));
    }

    /** Uma única escrita no banco em vez de um save por notificação. */
    private long marcarLidasEmLote(List<Notificacao> pendentes) {
        if (pendentes.isEmpty()) return 0;
        mongoTemplate.updateMulti(Query.query(Criteria.where("_id").in(pendentes.stream().map(Notificacao::getId).toList())),
                new Update().set("lida", true), Notificacao.class);
        DbRefCache.limpar();
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
        marcarLidasEmLote(notificacaoRepository
                .findByUsuario_IdAndSolicitacao_IdAndLidaFalse(usuario.getId(), solicitacao.getId()));
    }
}
