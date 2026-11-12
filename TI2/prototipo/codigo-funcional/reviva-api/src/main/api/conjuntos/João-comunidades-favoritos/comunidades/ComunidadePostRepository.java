package com.reviva.api.repository;

import com.reviva.api.model.ComunidadePost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ComunidadePostRepository extends MongoRepository<ComunidadePost, String> {
    List<ComunidadePost> findTop50ByComunidadeIdOrderByCriadoEmDesc(String comunidadeId);
    List<ComunidadePost> findByComunidadeIdOrderByCriadoEmAsc(String comunidadeId);
    List<ComunidadePost> findByComunidadeIdOrderByCriadoEmDesc(String comunidadeId, Pageable pageable);

    long countByComunidadeId(String comunidadeId);
    void deleteByComunidadeId(String comunidadeId);
}
