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
    List<Solicitacao> findByItem_DoadorOrderByCriadaEmDesc(Usuario doador);

    /** Solicitações enviadas pelo receptor. */
    List<Solicitacao> findByReceptorOrderByCriadaEmDesc(Usuario receptor);

    /** Conversas dos dois lados para a caixa de mensagens. */
    List<Solicitacao> findByItem_DoadorOrReceptorOrderByCriadaEmDesc(Usuario doador, Usuario receptor);

    default Optional<Solicitacao> findValidById(String id) {
        return findById(id);
    }
}
