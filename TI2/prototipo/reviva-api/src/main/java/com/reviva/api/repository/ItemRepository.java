package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, String> {

    List<Item> findByDoador(Usuario doador);

    List<Item> findByStatus(Item.StatusItem status);

    List<Item> findByCategoriaAndStatus(Item.Categoria categoria, Item.StatusItem status);

    @Query("select i from Item i join i.doador d where d.id = :doadorId and i.status <> 'REMOVIDO' and (i.expiraEm is null or i.expiraEm > CURRENT_TIMESTAMP) order by i.publicadoEm desc")
    List<Item> findPublicadosByDoadorId(@Param("doadorId") String doadorId);

    @Query("""
           select i from Item i join i.doador d
           where i.status = 'ATIVO'
             and (:doadorId is null or d.id <> :doadorId)
             and (i.expiraEm is null or i.expiraEm > CURRENT_TIMESTAMP)
             and (:categoria is null or i.categoria = :categoria)
             and (:tipo is null or i.tipoPublicacao = :tipo)
             and (:termo is null or lower(i.titulo) like lower(concat('%', :termo, '%'))
                  or lower(i.descricao) like lower(concat('%', :termo, '%')))
             and (:cidade is null or lower(i.cidade) = lower(:cidade))
             and (:uf is null or upper(i.uf) = upper(:uf))
           """)
    List<Item> buscar(@Param("categoria") Item.Categoria categoria,
                       @Param("tipo") Item.TipoPublicacao tipo,
                       @Param("termo") String termo,
                       @Param("cidade") String cidade,
                       @Param("uf") String uf,
                       @Param("doadorId") String doadorId);
}
