package com.reviva.api.repository;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, String> {
    List<Notificacao> findByUsuarioOrderByCriadaEmDesc(Usuario usuario);
}
