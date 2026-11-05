package com.reviva.api.repository;

import com.reviva.api.model.ComunidadePost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ComunidadePostRepository extends MongoRepository<ComunidadePost, String> {
    List<ComunidadePost> findTop50ByComunidadeIdOrderByCriadoEmDesc(String comunidadeId);

    long countByComunidadeId(String comunidadeId);
}
