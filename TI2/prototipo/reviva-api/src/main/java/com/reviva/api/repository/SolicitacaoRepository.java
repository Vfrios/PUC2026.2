package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, String> {
    List<Solicitacao> findByItem(Item item);
    List<Solicitacao> findByReceptor(Usuario receptor);
    List<Solicitacao> findByItem_DoadorAndStatus(Usuario doador, Solicitacao.StatusSolicitacao status);

    /** Solicitações recebidas pelo doador (em todos os seus itens). */
    List<Solicitacao> findByItem_DoadorOrderByCriadaEmDesc(Usuario doador);

    /** Solicitações enviadas pelo receptor. */
    List<Solicitacao> findByReceptorOrderByCriadaEmDesc(Usuario receptor);
}
