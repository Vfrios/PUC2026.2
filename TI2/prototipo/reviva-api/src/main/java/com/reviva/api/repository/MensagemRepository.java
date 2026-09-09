package com.reviva.api.repository;

import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Solicitacao;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MensagemRepository extends MongoRepository<Mensagem, String> {
    List<Mensagem> findBySolicitacaoOrderByCriadaEmAsc(Solicitacao solicitacao);
}
