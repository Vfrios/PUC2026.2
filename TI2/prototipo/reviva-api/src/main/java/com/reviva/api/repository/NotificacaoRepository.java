package com.reviva.api.repository;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.time.Instant;

public interface NotificacaoRepository extends MongoRepository<Notificacao, String> {
    List<Notificacao> findByUsuarioOrderByCriadaEmDesc(Usuario usuario);

    int deleteByUsuario_Id(String usuarioId);

    int deleteByUsuario_IdAndCriadaEmBefore(String usuarioId, Instant limite);
}
