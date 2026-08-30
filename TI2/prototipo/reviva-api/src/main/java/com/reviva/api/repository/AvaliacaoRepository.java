package com.reviva.api.repository;

import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, String> {
    List<Avaliacao> findByAvaliado(Usuario avaliado);
}
