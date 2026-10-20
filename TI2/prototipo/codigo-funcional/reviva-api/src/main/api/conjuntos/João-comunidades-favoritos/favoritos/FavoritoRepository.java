package com.reviva.api.repository;

import com.reviva.api.model.Favorito;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FavoritoRepository extends MongoRepository<Favorito, String> {
    List<Favorito> findByUsuarioIdOrderBySalvoEmDesc(String usuarioId);

    Optional<Favorito> findByUsuarioIdAndItemId(String usuarioId, String itemId);

    long deleteByUsuarioIdAndItemId(String usuarioId, String itemId);

    long deleteByUsuarioIdAndItemIdIn(String usuarioId, Collection<String> itemIds);
}
