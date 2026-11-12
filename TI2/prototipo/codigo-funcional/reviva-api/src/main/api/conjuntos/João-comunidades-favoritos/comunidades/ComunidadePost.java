package com.reviva.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/** Publicação no mural de uma comunidade. */
@Document("comunidade_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComunidadePost {

    @Id
    private String id;

    @Indexed
    private String comunidadeId;

    private String autorId;
    private String autorNome;
    private String autorFotoUrl;

    private String texto;

    @Builder.Default
    private Set<String> apoios = new HashSet<>();

    @Builder.Default
    private Instant criadoEm = Instant.now();
}
