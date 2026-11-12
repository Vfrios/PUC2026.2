package com.reviva.api.repository;

import com.reviva.api.model.Denuncia;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DenunciaRepository extends MongoRepository<Denuncia, String> {
}
