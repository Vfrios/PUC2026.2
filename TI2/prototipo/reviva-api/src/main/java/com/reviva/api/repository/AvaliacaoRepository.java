package com.reviva.api.repository;

import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AvaliacaoRepository extends MongoRepository<Avaliacao, String> {
    List<Avaliacao> findByAvaliado(Usuario avaliado);
}
