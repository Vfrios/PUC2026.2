package com.reviva.api.repository;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificacaoRepository extends MongoRepository<Notificacao, String> {
    List<Notificacao> findByUsuario_IdAndSolicitacao_IdAndLidaFalse(String usuarioId, String solicitacaoId);
}
