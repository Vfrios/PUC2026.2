package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SolicitacaoRepository extends MongoRepository<Solicitacao, String> {
    List<Solicitacao> findByItem(Item item);

    List<Solicitacao> findByItemIn(Collection<Item> itens);

    List<Solicitacao> findByReceptor(Usuario receptor);

    List<Solicitacao> findByReceptor_Id(String receptorId);

    List<Solicitacao> findByReceptor_IdOrderByCriadaEmDesc(String receptorId);

    /** Inbox do doador — campo denormalizado (confiável). */
    List<Solicitacao> findByDoadorId(String doadorId);

    List<Solicitacao> findByItem_DoadorAndStatus(Usuario doador, Solicitacao.StatusSolicitacao status);

    List<Solicitacao> findByItem_Doador_IdOrderByCriadaEmDesc(String doadorId);

    default Optional<Solicitacao> findValidById(String id) {
        return findById(id);
    }
}
