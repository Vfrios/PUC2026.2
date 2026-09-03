package com.reviva.api.service;

import com.reviva.api.dto.ItemRequest;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontuacaoService pontuacaoService;

    /** Prazo padrão de validade do anúncio — igual ao usado na publicação inicial (ver model/Item.java). */
    private static final long DIAS_VALIDADE_ANUNCIO = 60;

    public Item publicar(Item item) {
        item.setStatus(Item.StatusItem.ATIVO);
        return itemRepository.save(item);
    }

    public List<Item> buscar(Item.Categoria categoria, Item.TipoPublicacao tipo, String termo, String cidade, String uf, Usuario usuario) {
        return itemRepository.buscar(categoria, tipo, termo, cidade, uf, usuario == null ? null : usuario.getId());
    }

    public List<Item> meusItens(Usuario doador) {
        return itemRepository.findByDoador(doador);
    }

    public Item buscarPorId(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado: " + id));
    }

    /** Edita os dados do anúncio (só o próprio doador pode editar) e renova o
     *  prazo de validade por mais 60 dias, igual à OLX. */
    @Transactional
    public Item editar(String itemId, ItemRequest req, Usuario doador) {
        Item item = buscarDoProprioDoador(itemId, doador);
        item.setTitulo(req.titulo());
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
        if (item.getStatus() != Item.StatusItem.DOADO) {
            item.setStatus(Item.StatusItem.DOADO);
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
        item.setStatus(Item.StatusItem.REMOVIDO);
        return itemRepository.save(item);
    }

    @Transactional
    public Item restaurar(String itemId, Usuario doador) {
        Item item = buscarDoProprioDoador(itemId, doador);
        if (item.getStatus() != Item.StatusItem.REMOVIDO && !estaExpirado(item)) {
            throw new IllegalArgumentException("Este item ainda está ativo.");
        }
        item.setStatus(Item.StatusItem.ATIVO);
        item.setExpiraEm(Instant.now().plus(DIAS_VALIDADE_ANUNCIO, ChronoUnit.DAYS));
        return itemRepository.save(item);
    }

    private boolean estaExpirado(Item item) {
        return item.getExpiraEm() != null && item.getExpiraEm().isBefore(Instant.now());
    }

    private Item buscarDoProprioDoador(String itemId, Usuario doador) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado: " + itemId));
        if (doador != null && item.getDoador() != null && !item.getDoador().getId().equals(doador.getId())) {
            throw new IllegalArgumentException("Você só pode gerenciar os seus próprios itens.");
        }
        return item;
    }
}
