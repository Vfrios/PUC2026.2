package com.reviva.api.repository;

import com.reviva.api.model.Bloqueio;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BloqueioRepository extends MongoRepository<Bloqueio, String> {

    Optional<Bloqueio> findByBloqueadorIdAndBloqueadoId(String bloqueadorId, String bloqueadoId);

    List<Bloqueio> findByBloqueadorIdOrderByCriadoEmDesc(String bloqueadorId);

    List<Bloqueio> findByBloqueadoId(String bloqueadoId);

    boolean existsByBloqueadorIdAndBloqueadoId(String bloqueadorId, String bloqueadoId);

    void deleteByBloqueadorIdAndBloqueadoId(String bloqueadorId, String bloqueadoId);
}