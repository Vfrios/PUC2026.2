package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface ItemRepository extends MongoRepository<Item, String> {

    List<Item> findByDoador(Usuario doador);

    /** Preferir este método: DBRef por id é mais confiável que a entidade inteira. */
    List<Item> findByDoador_Id(String doadorId);

    List<Item> findByStatus(Item.StatusItem status);

    List<Item> findByStatusIn(Collection<Item.StatusItem> status);

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
        return buscar(categoria, tipo, termo, cidade, uf, doadorId, true);
    }

    /**
     * Busca pública. Com somenteDisponiveis=false também devolve itens em
     * negociação (reservados), para a vitrine indicar que estão indisponíveis.
     */
    default List<Item> buscar(Item.Categoria categoria, Item.TipoPublicacao tipo, String termo,
                              String cidade, String uf, String doadorId, boolean somenteDisponiveis) {
        List<Item> base = somenteDisponiveis
                ? findByStatus(Item.StatusItem.ATIVO)
                : findByStatusIn(List.of(Item.StatusItem.ATIVO, Item.StatusItem.EM_NEGOCIACAO));
        return filtrar(base, categoria, tipo, termo, cidade, uf, doadorId);
    }

    static List<Item> filtrar(List<Item> base, Item.Categoria categoria, Item.TipoPublicacao tipo, String termo,
                              String cidade, String uf, String doadorId) {
        String texto = termo == null ? null : termo.trim().toLowerCase();
        String cidadeNormalizada = cidade == null ? null : cidade.trim().toLowerCase();
        String ufNormalizada = uf == null ? null : uf.trim().toUpperCase();
        return base.stream()
                .filter(item -> doadorId == null || item.getDoador() == null || !doadorId.equals(item.getDoador().getId()))
                .filter(item -> categoria == null || item.getCategoria() == categoria)
                .filter(item -> tipo == null || item.getTipoPublicacao() == tipo)
                .filter(item -> texto == null || contem(item.getTitulo(), texto) || contem(item.getDescricao(), texto)
                        || contem(item.getBairro(), texto))
                .filter(item -> cidadeNormalizada == null || cidadeNormalizada.equals(normalize(item.getCidade())))
                .filter(item -> ufNormalizada == null || ufNormalizada.equals(item.getUf() == null ? null : item.getUf().trim().toUpperCase()))
                .filter(item -> item.getExpiraEm() == null || item.getExpiraEm().isAfter(java.time.Instant.now()))
                .sorted(java.util.Comparator.comparing(Item::getPublicadoEm, java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .toList();
    }

    private static boolean contem(String valor, String texto) {
        return valor != null && valor.toLowerCase().contains(texto);
    }

    private static String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }
}
