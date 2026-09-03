package com.reviva.api.repository;

import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, String> {
    List<Solicitacao> findByItem(Item item);
    List<Solicitacao> findByReceptor(Usuario receptor);
    List<Solicitacao> findByItem_DoadorAndStatus(Usuario doador, Solicitacao.StatusSolicitacao status);

    /** Solicitações recebidas pelo doador (em todos os seus itens). */
    @org.springframework.data.jpa.repository.Query("select s from Solicitacao s join s.item i join i.doador d where i.doador = :doador order by s.criadaEm desc")
    List<Solicitacao> findByItem_DoadorOrderByCriadaEmDesc(@Param("doador") Usuario doador);

    /** Solicitações enviadas pelo receptor. */
    @org.springframework.data.jpa.repository.Query("select s from Solicitacao s join s.item i join i.doador d join s.receptor r where s.receptor = :receptor order by s.criadaEm desc")
    List<Solicitacao> findByReceptorOrderByCriadaEmDesc(@Param("receptor") Usuario receptor);

    /** Conversas dos dois lados para a caixa de mensagens. */
    @org.springframework.data.jpa.repository.Query("select s from Solicitacao s join s.item i join i.doador d join s.receptor r where i.doador = :doador or s.receptor = :receptor order by s.criadaEm desc")
    List<Solicitacao> findByItem_DoadorOrReceptorOrderByCriadaEmDesc(@Param("doador") Usuario doador, @Param("receptor") Usuario receptor);

    @org.springframework.data.jpa.repository.Query("select s from Solicitacao s join s.item i join i.doador d join s.receptor r where s.id = :id")
    Optional<Solicitacao> findValidById(@Param("id") String id);
}
