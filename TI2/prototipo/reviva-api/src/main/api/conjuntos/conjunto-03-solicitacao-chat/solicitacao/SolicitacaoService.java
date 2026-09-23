package com.reviva.api.service;

import com.reviva.api.dto.SolicitacaoResponse;
import com.reviva.api.model.Item;
import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final MensagemRepository mensagemRepository;
    private final NotificacaoService notificacaoService;
    private final ItemRepository itemRepository;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public Solicitacao solicitar(Item item, Usuario receptor, String mensagem) {
        String doadorId = item.getDoador() != null ? item.getDoador().getId() : null;

        Solicitacao existente = solicitacaoRepository.findByItem(item).stream()
                .filter(s -> s.getReceptor() != null && receptor.getId().equals(s.getReceptor().getId()))
                .filter(s -> s.getStatus() != Solicitacao.StatusSolicitacao.CANCELADA)
                .findFirst()
                .orElse(null);

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

    /**
     * Inbox: receptor OU doador. Combina:
     * 1) doadorId denormalizado
     * 2) receptor.$id
     * 3) itens do usuário + solicitacoes por item.$id (String e ObjectId)
     * 4) findByItem(entidade) como último fallback + backfill de doadorId
     */
    public List<Solicitacao> listarConversas(Usuario usuario) {
        Map<String, Solicitacao> porId = new LinkedHashMap<>();
        String usuarioId = usuario.getId();

        for (Solicitacao s : solicitacaoRepository.findByDoadorId(usuarioId)) {
            adicionarSeValida(porId, s);
        }

        for (Solicitacao s : solicitacaoRepository.findByReceptor_Id(usuarioId)) {
            adicionarSeValida(porId, s);
        }

        // Itens do doador (entidade JWT + id)
        List<Item> meusItens = itemRepository.findByDoador(usuario);
        if (meusItens.isEmpty()) {
            meusItens = itemRepository.findByDoador_Id(usuarioId);
        }
        if (meusItens.isEmpty()) {
            meusItens = buscarItensDoDoadorViaTemplate(usuarioId);
        }

        if (!meusItens.isEmpty()) {
            List<String> itemIds = meusItens.stream()
                    .map(Item::getId)
                    .filter(id -> id != null && !id.isBlank())
                    .distinct()
                    .toList();

            for (Solicitacao s : buscarSolicitacoesPorItemIds(itemIds)) {
                backfillDoadorId(s, usuarioId);
                adicionarSeValida(porId, s);
            }

            for (Item item : meusItens) {
                for (Solicitacao s : solicitacaoRepository.findByItem(item)) {
                    backfillDoadorId(s, usuarioId);
                    adicionarSeValida(porId, s);
                }
            }
        }

        return new ArrayList<>(porId.values());
    }

    public List<SolicitacaoResponse> listarConversasComPreview(Usuario usuario) {
        return comPreview(listarConversas(usuario));
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
        return solicitacaoRepository.findByReceptor_Id(receptor.getId()).stream()
                .filter(this::ehValidaBasica)
                .toList();
    }

    public List<SolicitacaoResponse> listarEnviadasComPreview(Usuario receptor) {
        return comPreview(listarEnviadas(receptor));
    }

    private List<Item> buscarItensDoDoadorViaTemplate(String doadorId) {
        List<Object> ids = idsParaQuery(doadorId);
        Query q = new Query(new Criteria().orOperator(
                Criteria.where("doador.$id").in(ids),
                Criteria.where("doador.id").in(ids)
        ));
        return mongoTemplate.find(q, Item.class);
    }

    private List<Solicitacao> buscarSolicitacoesPorItemIds(List<String> itemIds) {
        if (itemIds.isEmpty()) return List.of();
        List<Object> ids = new ArrayList<>();
        for (String id : itemIds) {
            ids.addAll(idsParaQuery(id));
        }
        Query q = new Query(new Criteria().orOperator(
                Criteria.where("item.$id").in(ids),
                Criteria.where("item.id").in(ids)
        ));
        return mongoTemplate.find(q, Solicitacao.class);
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

    private List<SolicitacaoResponse> comPreview(List<Solicitacao> solicitacoes) {
        record Par(Solicitacao s, Mensagem ultima) {}
        return solicitacoes.stream()
                .map(s -> new Par(s, mensagemRepository.findFirstBySolicitacaoOrderByCriadaEmDesc(s)))
                .sorted(Comparator
                        .comparing((Par p) -> p.ultima() != null ? p.ultima().getCriadaEm() : p.s().getCriadaEm(),
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .map(p -> SolicitacaoResponse.from(p.s(), p.ultima()))
                .toList();
    }

    /** Aceita conversa mesmo se item/receptor vierem incompletos no DBRef. */
    private boolean ehValidaBasica(Solicitacao s) {
        return s != null && s.getId() != null;
    }
}
