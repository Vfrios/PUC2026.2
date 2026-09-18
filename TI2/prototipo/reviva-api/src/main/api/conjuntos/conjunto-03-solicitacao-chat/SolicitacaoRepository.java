package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoRepository extends MongoRepository<Solicitacao, String> {
    List<Solicitacao> findByItem(Item item);
    List<Solicitacao> findByReceptor(Usuario receptor);
    List<Solicitacao> findByItem_DoadorAndStatus(Usuario doador, Solicitacao.StatusSolicitacao status);

    /** Solicitações recebidas pelo doador (em todos os seus itens). */
    List<Solicitacao> findByItem_Doador_IdOrderByCriadaEmDesc(String doadorId);

    /** Solicitações enviadas pelo receptor. */
    List<Solicitacao> findByReceptor_IdOrderByCriadaEmDesc(String receptorId);

    /** Conversas dos dois lados para a caixa de mensagens. */
    List<Solicitacao> findByItem_Doador_IdOrReceptor_IdOrderByCriadaEmDesc(String doadorId, String receptorId);

    default Optional<Solicitacao> findValidById(String id) {
        return findById(id);
    }
}
