package com.reviva.api.repository;

import com.reviva.api.model.Endereco;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EnderecoRepository extends MongoRepository<Endereco, String> {
    List<Endereco> findByUsuarioIdOrderByPrincipalDescCriadoEmAsc(String usuarioId);

    long countByUsuarioId(String usuarioId);
}
