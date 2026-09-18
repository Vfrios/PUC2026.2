package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ItemRepository extends MongoRepository<Item, String> {

    List<Item> findByDoador(Usuario doador);

    List<Item> findByStatus(Item.StatusItem status);

    List<Item> findByCategoriaAndStatus(Item.Categoria categoria, Item.StatusItem status);

    List<Item> findByDoador_IdAndStatusNotOrderByPublicadoEmDesc(String doadorId, Item.StatusItem status);

    default List<Item> findPublicadosByDoadorId(String doadorId) {
        return findByDoador_IdAndStatusNotOrderByPublicadoEmDesc(doadorId, Item.StatusItem.REMOVIDO)
                .stream()
                .filter(item -> item.getExpiraEm() == null || item.getExpiraEm().isAfter(java.time.Instant.now()))
                .toList();
    }

    default List<Item> buscar(Item.Categoria categoria, Item.TipoPublicacao tipo, String termo,
                              String cidade, String uf, String doadorId) {
        String texto = termo == null ? null : termo.trim().toLowerCase();
        String cidadeNormalizada = cidade == null ? null : cidade.trim().toLowerCase();
        String ufNormalizada = uf == null ? null : uf.trim().toUpperCase();
        return findByStatus(Item.StatusItem.ATIVO).stream()
                .filter(item -> doadorId == null || item.getDoador() == null || !doadorId.equals(item.getDoador().getId()))
                .filter(item -> categoria == null || item.getCategoria() == categoria)
                .filter(item -> tipo == null || item.getTipoPublicacao() == tipo)
                .filter(item -> texto == null || (item.getTitulo() != null && item.getTitulo().toLowerCase().contains(texto))
                        || (item.getDescricao() != null && item.getDescricao().toLowerCase().contains(texto)))
                .filter(item -> cidadeNormalizada == null || cidadeNormalizada.equals(normalize(item.getCidade())))
                .filter(item -> ufNormalizada == null || ufNormalizada.equals(item.getUf() == null ? null : item.getUf().trim().toUpperCase()))
                .filter(item -> item.getExpiraEm() == null || item.getExpiraEm().isAfter(java.time.Instant.now()))
                .sorted(java.util.Comparator.comparing(Item::getPublicadoEm, java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .toList();
    }

    private static String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }
}
