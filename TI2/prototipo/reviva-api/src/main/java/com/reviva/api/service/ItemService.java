package com.reviva.api.service;

import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    public Item publicar(Item item) {
        item.setStatus(Item.StatusItem.ATIVO);
        return itemRepository.save(item);
    }

    public List<Item> buscar(Item.Categoria categoria, Item.TipoPublicacao tipo, String termo, String cidade, String uf) {
        return itemRepository.buscar(categoria, tipo, termo, cidade, uf);
    }

    public List<Item> meusItens(Usuario doador) {
        return itemRepository.findByDoador(doador);
    }

    public Item buscarPorId(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado: " + id));
    }

    public Item marcarComoDoado(String itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado: " + itemId));
        item.setStatus(Item.StatusItem.DOADO);
        return itemRepository.save(item);
    }

    public Item remover(String itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado: " + itemId));
        item.setStatus(Item.StatusItem.REMOVIDO);
        return itemRepository.save(item);
    }
}
