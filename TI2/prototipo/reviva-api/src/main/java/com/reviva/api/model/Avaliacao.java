package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Document("avaliacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    private String id;

    @DBRef(lazy = false)
    private Agendamento agendamento;

    @DBRef(lazy = false)
    private Usuario avaliador;

    @DBRef(lazy = false)
    private Usuario avaliado;

    @Min(1) @Max(5)
    private int nota;

    private String comentario;

    @Builder.Default
    private Instant criadaEm = Instant.now();
}
