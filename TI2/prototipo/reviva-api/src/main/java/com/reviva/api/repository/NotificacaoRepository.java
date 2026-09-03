package com.reviva.api.repository;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.Instant;

public interface NotificacaoRepository extends JpaRepository<Notificacao, String> {
    List<Notificacao> findByUsuarioOrderByCriadaEmDesc(Usuario usuario);

    @Modifying
    @Query("delete from Notificacao n where n.usuario.id = :usuarioId")
    int deleteByUsuarioId(@Param("usuarioId") String usuarioId);

    @Modifying
    @Query("delete from Notificacao n where n.usuario.id = :usuarioId and n.criadaEm < :limite")
    int deleteByUsuarioIdAndCriadaEmBefore(@Param("usuarioId") String usuarioId, @Param("limite") Instant limite);
}
