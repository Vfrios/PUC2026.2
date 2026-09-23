package com.reviva.api.service;

import com.reviva.api.dto.ItemRequest;
import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontuacaoService pontuacaoService;
    private final MongoTemplate mongoTemplate;

    /** Prazo padrão de validade do anúncio — igual ao usado na publicação inicial (ver model/Item.java). */
    private static final long DIAS_VALIDADE_ANUNCIO = 60;

    public enum AcaoLote { REMOVER, DOADO, RESTAURAR }

    public Item publicar(Item item) {
        validarDuplicidade(item.getDoador(), item.getTitulo(), item.getCategoria(), null);
        item.setStatus(Item.StatusItem.ATIVO);
        if (item.getModoEntrega() == null) item.setModoEntrega(Item.ModoEntrega.RETIRADA);
        return itemRepository.save(item);
    }

    public List<Item> buscar(Item.Categoria categoria, Item.TipoPublicacao tipo, String termo, String cidade, String uf,
                             boolean somenteDisponiveis, Usuario usuario) {
        Instant agora = Instant.now();
        return itemRepository.buscar(categoria, tipo, termo, cidade, uf, usuario == null ? null : usuario.getId(), somenteDisponiveis)
                .stream()
                .filter(item -> item.getExpiraEm() == null || item.getExpiraEm().isAfter(agora))
                .toList();
    }

    public List<Item> meusItens(Usuario doador) {
        return itemRepository.findByDoador(doador);
    }

    public Item buscarPorId(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado ou removido."));
    }

    /** Edita os dados do anúncio (só o próprio doador pode editar) e renova o
     *  prazo de validade por mais 60 dias, igual à OLX. */
    @Transactional
    public Item editar(String itemId, ItemRequest req, Usuario doador) {
        Item item = buscarDoProprioDoador(itemId, doador);
        if (item.getStatus() == Item.StatusItem.DOADO) {
            throw new IllegalArgumentException("Itens já doados não podem ser editados.");
        }
        validarDuplicidade(doador, req.titulo(), req.categoria(), item.getId());
        item.setTitulo(req.titulo().trim());
        item.setDescricao(req.descricao());
        item.setCategoria(req.categoria());
        item.setEstadoConservacao(req.estadoConservacao());
        item.setTipoPublicacao(req.tipoPublicacao());
        if (req.cep() != null) item.setCep(req.cep());
        if (req.numero() != null) item.setNumero(req.numero());
        if (req.complemento() != null) item.setComplemento(req.complemento());
        if (req.bairro() != null) item.setBairro(req.bairro());
        if (req.cidade() != null) item.setCidade(req.cidade());
        if (req.uf() != null) item.setUf(req.uf());
        if (req.latitude() != null) item.setLatitude(req.latitude());
        if (req.longitude() != null) item.setLongitude(req.longitude());
        if (req.impactoCo2Kg() != null) item.setImpactoCo2Kg(req.impactoCo2Kg());
        if (req.pesoKg() != null) item.setPesoKg(req.pesoKg());
        if (req.fotosUrls() != null) item.setFotosUrls(req.fotosUrls());
        if (req.modoEntrega() != null) item.setModoEntrega(req.modoEntrega());
        item.setRegrasRetirada(req.regrasRetirada());
        item.setAtualizadoEm(Instant.now());
        item.setExpiraEm(Instant.now().plus(DIAS_VALIDADE_ANUNCIO, ChronoUnit.DAYS));
        return itemRepository.save(item);
    }

    /** Confirmação rápida de doação a partir de "Gerenciar itens" (sem precisar
     *  passar pelo fluxo completo de agendamento/QR Code). Atualiza o perfil do
     *  doador na hora: kg evitados, contagem de itens doados, pontos e selo —
     *  a mesma lógica usada quando a doação é concluída via agendamento. */
    @Transactional
    public Item marcarComoDoado(String itemId, Usuario doador) {
        Item item = buscarDoProprioDoador(itemId, doador);
        if (item.getStatus() == Item.StatusItem.REMOVIDO) {
            throw new IllegalArgumentException("Restaure o item antes de marcá-lo como doado.");
        }
        if (item.getStatus() != Item.StatusItem.DOADO) {
            item.setStatus(Item.StatusItem.DOADO);
            item.setAtualizadoEm(Instant.now());
            Usuario donoAtualizado = item.getDoador();
            donoAtualizado.setItensDoados(donoAtualizado.getItensDoados() + 1);
            donoAtualizado.setKgResiduoEvitado(donoAtualizado.getKgResiduoEvitado() + (item.getPesoKg() != null ? item.getPesoKg() : (item.getImpactoCo2Kg() != null ? item.getImpactoCo2Kg() : 0)));
            usuarioRepository.save(donoAtualizado);
            pontuacaoService.adicionar(donoAtualizado, PontuacaoService.PONTOS_DOACAO_CONCLUIDA);
        }
        return itemRepository.save(item);
    }

    @Transactional
    public Item remover(String itemId, Usuario doador) {
        Item item = buscarDoProprioDoador(itemId, doador);
        if (item.getStatus() == Item.StatusItem.DOADO) {
            throw new IllegalArgumentException("Itens já doados ficam no histórico e não podem ser removidos.");
        }
        item.setStatus(Item.StatusItem.REMOVIDO);
        item.setAtualizadoEm(Instant.now());
        return itemRepository.save(item);
    }

    @Transactional
    public Item restaurar(String itemId, Usuario doador) {
        Item item = buscarDoProprioDoador(itemId, doador);
        if (item.getStatus() != Item.StatusItem.REMOVIDO && !estaExpirado(item)) {
            throw new IllegalArgumentException("Este item ainda está ativo.");
        }
        if (item.getStatus() == Item.StatusItem.DOADO) {
            throw new IllegalArgumentException("Itens doados não podem ser restaurados.");
        }
        validarDuplicidade(doador, item.getTitulo(), item.getCategoria(), item.getId());
        item.setStatus(Item.StatusItem.ATIVO);
        item.setAtualizadoEm(Instant.now());
        item.setExpiraEm(Instant.now().plus(DIAS_VALIDADE_ANUNCIO, ChronoUnit.DAYS));
        return itemRepository.save(item);
    }

    /** Aplica a mesma ação a vários itens; itens que não aceitam a ação são ignorados. */
    @Transactional
    public List<Item> aplicarEmLote(List<String> ids, AcaoLote acao, Usuario doador) {
        if (ids == null || ids.isEmpty()) throw new IllegalArgumentException("Selecione ao menos um item.");
        List<Item> resultado = new ArrayList<>();
        for (String id : ids) {
            try {
                resultado.add(switch (acao) {
                    case REMOVER -> remover(id, doador);
                    case DOADO -> marcarComoDoado(id, doador);
                    case RESTAURAR -> restaurar(id, doador);
                });
            } catch (IllegalArgumentException | ResponseStatusException ignorado) {
                // segue com os demais itens selecionados
            }
        }
        return resultado;
    }

    /** Quantidade de pessoas com conversa não cancelada sobre cada item. */
    public Map<String, Integer> contarInteressados(List<Item> itens) {
        Map<String, Integer> contagem = new HashMap<>();
        if (itens == null || itens.isEmpty()) return contagem;
        List<Object> ids = new ArrayList<>();
        for (Item item : itens) {
            if (item.getId() == null) continue;
            contagem.put(item.getId(), 0);
            ids.add(item.getId());
            if (ObjectId.isValid(item.getId())) ids.add(new ObjectId(item.getId()));
        }
        Query q = new Query(new Criteria().andOperator(
                new Criteria().orOperator(Criteria.where("item.$id").in(ids), Criteria.where("item.id").in(ids)),
                Criteria.where("status").ne(Solicitacao.StatusSolicitacao.CANCELADA.name())
        ));
        for (Solicitacao s : mongoTemplate.find(q, Solicitacao.class)) {
            if (s.getItem() == null || s.getItem().getId() == null) continue;
            contagem.merge(s.getItem().getId(), 1, Integer::sum);
        }
        return contagem;
    }

    public int contarInteressados(Item item) {
        return contarInteressados(List.of(item)).getOrDefault(item.getId(), 0);
    }

    private void validarDuplicidade(Usuario doador, String titulo, Item.Categoria categoria, String ignorarId) {
        if (doador == null || titulo == null) return;
        String alvo = normalizar(titulo);
        boolean duplicado = itemRepository.findByDoador_Id(doador.getId()).stream()
                .filter(i -> ignorarId == null || !ignorarId.equals(i.getId()))
                .filter(i -> i.getStatus() == Item.StatusItem.ATIVO || i.getStatus() == Item.StatusItem.EM_NEGOCIACAO)
                .filter(i -> !estaExpirado(i))
                .anyMatch(i -> i.getCategoria() == categoria && alvo.equals(normalizar(i.getTitulo())));
        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Você já tem um anúncio ativo com esse título nessa categoria. Edite o anúncio existente ou use outro título.");
        }
    }

    private static String normalizar(String texto) {
        if (texto == null) return "";
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return semAcento.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private boolean estaExpirado(Item item) {
        return item.getExpiraEm() != null && item.getExpiraEm().isBefore(Instant.now());
    }

    private Item buscarDoProprioDoador(String itemId, Usuario doador) {
        Item item = buscarPorId(itemId);
        if (doador != null && item.getDoador() != null && !item.getDoador().getId().equals(doador.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode gerenciar os seus próprios itens.");
        }
        return item;
    }
}
