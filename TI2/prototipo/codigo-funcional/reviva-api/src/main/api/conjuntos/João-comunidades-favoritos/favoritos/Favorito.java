package com.reviva.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Item salvo por um usuário. Um único registro por par usuário + item. */
@Document("favoritos")
@CompoundIndex(name = "usuario_item_unique", def = "{'usuarioId': 1, 'itemId': 1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Favorito {

    @Id
    private String id;

    private String usuarioId;
    private String itemId;

    @Builder.Default
    private Instant salvoEm = Instant.now();
}
