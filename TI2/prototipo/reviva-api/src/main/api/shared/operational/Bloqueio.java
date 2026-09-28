package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Document("bloqueios")
@CompoundIndex(name = "bloqueio_unico", def = "{'bloqueadorId': 1, 'bloqueadoId': 1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bloqueio {

    @Id
    private String id;

    private String bloqueadorId;
    private String bloqueadoId;

    @Builder.Default
    private Instant criadoEm = Instant.now();
}