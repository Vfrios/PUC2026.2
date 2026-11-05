package com.reviva.api.repository;

import com.reviva.api.model.Comunidade;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ComunidadeRepository extends MongoRepository<Comunidade, String> {
}
