package com.reviva.api.repository;

import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensagemRepository extends JpaRepository<Mensagem, String> {
    List<Mensagem> findBySolicitacaoOrderByCriadaEmAsc(Solicitacao solicitacao);
}
