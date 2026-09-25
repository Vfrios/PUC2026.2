package com.reviva.api.service;

import com.reviva.api.config.CarregadorEmLote;
import com.reviva.api.dto.SolicitacaoResponse;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Item;
import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.mongodb.DBRef;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final MensagemRepository mensagemRepository;
    private final NotificacaoService notificacaoService;
    private final ItemRepository itemRepository;
    private final MongoTemplate mongoTemplate;
    private final AgendamentoRepository agendamentoRepository;
    private final AgendamentoService agendamentoService;
    private final CarregadorEmLote carregadorEmLote;

    @Transactional
    public Solicitacao solicitar(Item item, Usuario receptor, String mensagem) {
        String doadorId = item.getDoador() != null ? item.getDoador().getId() : null;
        if (receptor.getId().equals(doadorId)) {
            throw new IllegalArgumentException("Você não pode solicitar o seu próprio item.");
        }

        Solicitacao existente = solicitacaoRepository.findByItem(item).stream()
                .filter(s -> s.getReceptor() != null && receptor.getId().equals(s.getReceptor().getId()))
                .filter(s -> s.getStatus() != Solicitacao.StatusSolicitacao.CANCELADA
                        && s.getStatus() != Solicitacao.StatusSolicitacao.RECUSADA)
                .findFirst()
                .orElse(null);

        boolean expirado = item.getExpiraEm() != null && item.getExpiraEm().isBefore(java.time.Instant.now());
        if (existente == null && (item.getStatus() != Item.StatusItem.ATIVO || expirado)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    item.getStatus() == Item.StatusItem.EM_NEGOCIACAO
                            ? "Este item está reservado para outra pessoa no momento."
                            : "Este item não está mais disponível.");
        }

        if (existente != null) {
            if (existente.getDoadorId() == null && doadorId != null) {
                existente.setDoadorId(doadorId);
            }
            if (mensagem != null && !mensagem.isBlank()) {
                existente.setMensagem(mensagem);
                solicitacaoRepository.save(existente);
                mensagemRepository.save(Mensagem.builder()
                        .solicitacao(existente)
                        .remetente(receptor)
                        .texto(mensagem)
                        .entregue(false)
                        .lida(false)
                        .build());
                notificacaoService.notificar(item.getDoador(),
                        receptor.getNome() + " enviou uma mensagem sobre \"" + item.getTitulo() + "\"",
                        Notificacao.Tipo.CHAT, existente);
            } else if (existente.getDoadorId() == null && doadorId != null) {
                solicitacaoRepository.save(existente);
            }
            return existente;
        }

        Solicitacao solicitacao = Solicitacao.builder()
                .item(item)
                .receptor(receptor)
                .doadorId(doadorId)
                .mensagem(mensagem)
                .status(Solicitacao.StatusSolicitacao.ACEITA)
                .build();
        solicitacao = solicitacaoRepository.save(solicitacao);

        if (mensagem != null && !mensagem.isBlank()) {
            mensagemRepository.save(Mensagem.builder()
                    .solicitacao(solicitacao)
                    .remetente(receptor)
                    .texto(mensagem)
                    .entregue(false)
                    .lida(false)
                    .build());
        }

        notificacaoService.notificar(item.getDoador(),
                receptor.getNome() + " enviou uma mensagem sobre \"" + item.getTitulo() + "\"",
                Notificacao.Tipo.CHAT, solicitacao);

        return solicitacao;
    }

    /** Só o doador do item ou o receptor da solicitação podem consultá-la. */
    public Solicitacao buscarComAcesso(String id, Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findValidById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada"));
        if (!ehDoador(solicitacao, usuario) && !ehReceptor(solicitacao, usuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta solicitação");
        }
        return solicitacao;
    }

    /** Cancelamento por qualquer uma das partes enquanto a troca não foi concluída. */
    @Transactional
    public Solicitacao cancelar(String id, Usuario usuario) {
        Solicitacao solicitacao = buscarComAcesso(id, usuario);
        if (solicitacao.getStatus() == Solicitacao.StatusSolicitacao.CANCELADA
                || solicitacao.getStatus() == Solicitacao.StatusSolicitacao.RECUSADA) {
            return solicitacao;
        }
        var agendamento = agendamentoRepository.findBySolicitacaoId(solicitacao.getId()).orElse(null);
        if (agendamento != null && agendamento.getStatus() != Agendamento.StatusAgendamento.CANCELADO) {
            agendamentoService.cancelar(agendamento, usuario);
            return solicitacaoRepository.findById(solicitacao.getId()).orElse(solicitacao);
        }
        solicitacao.setStatus(Solicitacao.StatusSolicitacao.CANCELADA);
        solicitacao = solicitacaoRepository.save(solicitacao);
        agendamentoService.publicarEventoPublico(solicitacao, usuario, "{\"tipo\":\"SOLICITACAO_CANCELADA\"}");
        notificarOutraParte(solicitacao, usuario, " cancelou a conversa sobre \"");
        return solicitacao;
    }

    /** O anunciante recusa o pedido; o item continua disponível para outras pessoas. */
    @Transactional
    public Solicitacao recusar(String id, Usuario doador) {
        Solicitacao solicitacao = buscarComAcesso(id, doador);
        if (!ehDoador(solicitacao, doador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente o anunciante pode recusar a solicitação.");
        }
        var agendamento = agendamentoRepository.findBySolicitacaoId(solicitacao.getId()).orElse(null);
        if (agendamento != null && agendamento.getStatus() == Agendamento.StatusAgendamento.CONCLUIDO) {
            throw new IllegalArgumentException("Uma troca concluída não pode ser recusada.");
        }
        if (agendamento != null && agendamento.getStatus() != Agendamento.StatusAgendamento.CANCELADO) {
            agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
            agendamentoRepository.save(agendamento);
        }
        solicitacao.setStatus(Solicitacao.StatusSolicitacao.RECUSADA);
        solicitacao = solicitacaoRepository.save(solicitacao);
        agendamentoService.liberarItem(solicitacao.getItem());
        agendamentoService.publicarEventoPublico(solicitacao, doador, "{\"tipo\":\"SOLICITACAO_RECUSADA\"}");
        notificarOutraParte(solicitacao, doador, " recusou a solicitação do item \"");
        return solicitacao;
    }

    private void notificarOutraParte(Solicitacao solicitacao, Usuario autor, String acao) {
        Usuario outro = ehReceptor(solicitacao, autor)
                ? (solicitacao.getItem() != null ? solicitacao.getItem().getDoador() : null)
                : solicitacao.getReceptor();
        if (outro == null) return;
        String titulo = solicitacao.getItem() != null && solicitacao.getItem().getTitulo() != null
                ? solicitacao.getItem().getTitulo() : "item";
        notificacaoService.notificar(outro, autor.getNome() + acao + titulo + "\"", Notificacao.Tipo.LEMBRETE, solicitacao);
    }

    private boolean ehDoador(Solicitacao s, Usuario u) {
        String doadorId = s.getDoadorId();
        if ((doadorId == null || doadorId.isBlank()) && s.getItem() != null && s.getItem().getDoador() != null) {
            doadorId = s.getItem().getDoador().getId();
        }
        return u != null && u.getId().equals(doadorId);
    }

    private boolean ehReceptor(Solicitacao s, Usuario u) {
        return u != null && s.getReceptor() != null && u.getId().equals(s.getReceptor().getId());
    }

    /**
     * Inbox: receptor OU doador. Combina:
     * 1) doadorId denormalizado
     * 2) receptor.$id
     * 3) itens do usuário + solicitacoes por item.$id (String e ObjectId)
     * 4) findByItem(entidade) como último fallback + backfill de doadorId
     */
    public List<Solicitacao> listarConversas(Usuario usuario) {
        String usuarioId = usuario.getId();
        List<Object> meusIds = idsParaQuery(usuarioId);
        List<String> meusItens = idsDosItensDoDoador(usuarioId);
        List<Object> itemIds = new ArrayList<>();
        meusItens.forEach(id -> itemIds.addAll(idsParaQuery(id)));

        // Uma consulta só: doador denormalizado, receptor ou qualquer item do usuário.
        List<Criteria> criterios = new ArrayList<>(List.of(
                Criteria.where("doadorId").is(usuarioId),
                Criteria.where("receptor.$id").in(meusIds),
                Criteria.where("receptor.id").in(meusIds)));
        if (!itemIds.isEmpty()) {
            criterios.add(Criteria.where("item.$id").in(itemIds));
            criterios.add(Criteria.where("item.id").in(itemIds));
        }
        Query q = new Query(new Criteria().orOperator(criterios));

        Map<String, Solicitacao> porId = new LinkedHashMap<>();
        for (Solicitacao s : carregadorEmLote.buscar(q.getQueryObject(), Solicitacao.class)) {
            if (s.getItem() != null && meusItens.contains(s.getItem().getId())) {
                backfillDoadorId(s, usuarioId);
            }
            adicionarSeValida(porId, s);
        }
        return new ArrayList<>(porId.values());
    }

    /** Só os ids (sem carregar o doador de cada item). */
    private List<String> idsDosItensDoDoador(String doadorId) {
        List<Object> ids = idsParaQuery(doadorId);
        Query q = new Query(new Criteria().orOperator(
                Criteria.where("doador.$id").in(ids),
                Criteria.where("doador.id").in(ids)
        ));
        q.fields().include("_id");
        return mongoTemplate.find(q, Item.class).stream().map(Item::getId).filter(Objects::nonNull).toList();
    }

    public List<SolicitacaoResponse> listarConversasComPreview(Usuario usuario) {
        List<Solicitacao> visiveis = listarConversas(usuario).stream()
                .filter(s -> !s.estaOcultaPara(usuario.getId()))
                .toList();
        return comPreview(visiveis, usuario);
    }

    /** Arquiva ou desarquiva só para o usuário logado. */
    @Transactional
    public SolicitacaoResponse definirArquivada(String id, Usuario usuario, boolean arquivar) {
        Solicitacao s = buscarComAcesso(id, usuario);
        List<String> arquivados = idsMutaveis(s.getInboxArquivadoPor());
        if (arquivar) {
            if (!arquivados.contains(usuario.getId())) arquivados.add(usuario.getId());
        } else {
            arquivados.remove(usuario.getId());
        }
        s.setInboxArquivadoPor(arquivados);
        return detalhe(solicitacaoRepository.save(s), usuario);
    }

    /** Some do Inbox deste usuário; a outra parte continua vendo a conversa. */
    @Transactional
    public void ocultarDoInbox(String id, Usuario usuario) {
        Solicitacao s = buscarComAcesso(id, usuario);
        List<String> ocultos = idsMutaveis(s.getInboxOcultoPor());
        if (!ocultos.contains(usuario.getId())) ocultos.add(usuario.getId());
        s.setInboxOcultoPor(ocultos);
        List<String> arquivados = idsMutaveis(s.getInboxArquivadoPor());
        arquivados.remove(usuario.getId());
        s.setInboxArquivadoPor(arquivados);
        solicitacaoRepository.save(s);
    }

    private List<String> idsMutaveis(List<String> atual) {
        return atual == null ? new ArrayList<>() : new ArrayList<>(atual);
    }

    public List<Solicitacao> listarRecebidas(Usuario doador) {
        return listarConversas(doador).stream()
                .filter(s -> doador.getId().equals(s.getDoadorId())
                        || (s.getItem() != null && s.getItem().getDoador() != null
                        && doador.getId().equals(s.getItem().getDoador().getId())))
                .toList();
    }

    public List<SolicitacaoResponse> listarRecebidasComPreview(Usuario doador) {
        return comPreview(listarRecebidas(doador));
    }

    public List<Solicitacao> listarEnviadas(Usuario receptor) {
        Document filtro = new Document("receptor.$id", new Document("$in", idsParaQuery(receptor.getId())));
        return carregadorEmLote.buscar(filtro, Solicitacao.class).stream()
                .filter(this::ehValidaBasica)
                .toList();
    }

    public List<SolicitacaoResponse> listarEnviadasComPreview(Usuario receptor) {
        return comPreview(listarEnviadas(receptor));
    }

    private List<Object> idsParaQuery(String id) {
        List<Object> ids = new ArrayList<>();
        if (id == null || id.isBlank()) return ids;
        ids.add(id);
        if (ObjectId.isValid(id)) {
            ids.add(new ObjectId(id));
        }
        return ids;
    }

    private void backfillDoadorId(Solicitacao s, String doadorId) {
        if (s == null || doadorId == null) return;
        if (s.getDoadorId() == null || s.getDoadorId().isBlank()) {
            s.setDoadorId(doadorId);
            try {
                solicitacaoRepository.save(s);
            } catch (Exception ignored) {
                // best-effort
            }
        }
    }

    private void adicionarSeValida(Map<String, Solicitacao> porId, Solicitacao s) {
        if (ehValidaBasica(s)) porId.put(s.getId(), s);
    }

    /** Resumo das mensagens de uma conversa: a última e quem já escreveu nela. */
    private record ResumoConversa(String texto, Instant criadaEm, Set<String> remetentes) {}

    /**
     * Monta o Inbox com número fixo de consultas (uma agregação para as mensagens e uma
     * para os agendamentos), em vez de três consultas por conversa.
     */
    private List<SolicitacaoResponse> comPreview(List<Solicitacao> solicitacoes) {
        return comPreview(solicitacoes, null);
    }

    private List<SolicitacaoResponse> comPreview(List<Solicitacao> solicitacoes, Usuario usuario) {
        if (solicitacoes.isEmpty()) return List.of();
        List<Object> refIds = new ArrayList<>();
        solicitacoes.forEach(s -> refIds.addAll(idsParaQuery(s.getId())));
        Map<String, ResumoConversa> resumos = resumirConversas(refIds);
        Map<String, Agendamento> agendamentos = agendamentosPorSolicitacao(refIds);
        String usuarioId = usuario != null ? usuario.getId() : null;

        record Par(Solicitacao s, ResumoConversa resumo) {
            Instant ordem() { return resumo != null && resumo.criadaEm() != null ? resumo.criadaEm() : s.getCriadaEm(); }
        }
        return solicitacoes.stream()
                .map(s -> new Par(s, resumos.get(s.getId())))
                .sorted(Comparator.comparing(Par::ordem, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(p -> {
                    ResumoConversa r = p.resumo();
                    Mensagem ultima = r == null ? null : Mensagem.builder().texto(r.texto()).criadaEm(r.criadaEm()).build();
                    String doadorId = doadorIdDe(p.s());
                    boolean respondeu = r != null && doadorId != null && r.remetentes().contains(doadorId);
                    return SolicitacaoResponse.from(p.s(), ultima, agendamentos.get(p.s().getId()), respondeu,
                            p.s().estaArquivadaPara(usuarioId));
                })
                .toList();
    }

    private Map<String, ResumoConversa> resumirConversas(List<Object> solicitacaoRefIds) {
        List<Document> pipeline = List.of(
                new Document("$match", new Document("solicitacao.$id", new Document("$in", solicitacaoRefIds))),
                new Document("$sort", new Document("criadaEm", -1)),
                new Document("$group", new Document("_id", "$solicitacao")
                        .append("texto", new Document("$first", "$texto"))
                        .append("criadaEm", new Document("$first", "$criadaEm"))
                        .append("remetentes", new Document("$addToSet", "$remetente"))));
        Map<String, ResumoConversa> resumos = new HashMap<>();
        for (Document d : mongoTemplate.getCollection(mongoTemplate.getCollectionName(Mensagem.class)).aggregate(pipeline)) {
            String sid = idDaReferencia(d.get("_id"));
            if (sid == null) continue;
            Set<String> remetentes = new HashSet<>();
            Object lista = d.get("remetentes");
            if (lista instanceof List<?> refs) refs.forEach(ref -> { String id = idDaReferencia(ref); if (id != null) remetentes.add(id); });
            Instant criadaEm = d.get("criadaEm") instanceof Date data ? data.toInstant() : null;
            ResumoConversa novo = new ResumoConversa(d.getString("texto"), criadaEm, remetentes);
            // Mesma conversa pode aparecer com id String e ObjectId: junta as duas.
            resumos.merge(sid, novo, (a, b) -> {
                Set<String> todos = new HashSet<>(a.remetentes());
                todos.addAll(b.remetentes());
                ResumoConversa maisRecente = a.criadaEm() != null && (b.criadaEm() == null || a.criadaEm().isAfter(b.criadaEm())) ? a : b;
                return new ResumoConversa(maisRecente.texto(), maisRecente.criadaEm(), todos);
            });
        }
        return resumos;
    }

    private Map<String, Agendamento> agendamentosPorSolicitacao(List<Object> solicitacaoRefIds) {
        Map<String, Agendamento> porSolicitacao = new HashMap<>();
        var docs = mongoTemplate.getCollection(mongoTemplate.getCollectionName(Agendamento.class))
                .find(new Document("solicitacao.$id", new Document("$in", solicitacaoRefIds)))
                .sort(new Document("_id", -1));
        for (Document d : docs) {
            String sid = idDaReferencia(d.remove("solicitacao"));
            // A solicitação já está carregada; sem o campo, o conversor não busca de novo.
            if (sid != null) porSolicitacao.putIfAbsent(sid, mongoTemplate.getConverter().read(Agendamento.class, d));
        }
        return porSolicitacao;
    }

    private static String idDaReferencia(Object ref) {
        if (ref instanceof DBRef dbRef) return String.valueOf(dbRef.getId());
        if (ref instanceof Document doc && doc.get("$id") != null) return String.valueOf(doc.get("$id"));
        return null;
    }

    private String doadorIdDe(Solicitacao s) {
        String doadorId = s.getDoadorId();
        if ((doadorId == null || doadorId.isBlank()) && s.getItem() != null && s.getItem().getDoador() != null) {
            doadorId = s.getItem().getDoador().getId();
        }
        return doadorId;
    }

    public SolicitacaoResponse detalhe(Solicitacao s) {
        return detalhe(s, null);
    }

    public SolicitacaoResponse detalhe(Solicitacao s, Usuario usuario) {
        return SolicitacaoResponse.from(s, mensagemRepository.findFirstBySolicitacaoOrderByCriadaEmDesc(s),
                agendamentoRepository.findBySolicitacaoId(s.getId()).orElse(null), doadorRespondeu(s),
                usuario != null && s.estaArquivadaPara(usuario.getId()));
    }

    private boolean doadorRespondeu(Solicitacao s) {
        String doadorId = s.getDoadorId();
        if ((doadorId == null || doadorId.isBlank()) && s.getItem() != null && s.getItem().getDoador() != null) {
            doadorId = s.getItem().getDoador().getId();
        }
        if (doadorId == null) return false;
        Query q = new Query(new Criteria().andOperator(
                Criteria.where("solicitacao.$id").in(idsParaQuery(s.getId())),
                Criteria.where("remetente.$id").in(idsParaQuery(doadorId))
        ));
        return mongoTemplate.exists(q, Mensagem.class);
    }

    /** Aceita conversa mesmo se item/receptor vierem incompletos no DBRef. */
    private boolean ehValidaBasica(Solicitacao s) {
        return s != null && s.getId() != null;
    }
}
