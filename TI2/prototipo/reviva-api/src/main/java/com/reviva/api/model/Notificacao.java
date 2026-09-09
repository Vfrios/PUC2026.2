package com.reviva.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Document("notificacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {

    @Id
    private String id;

    @JsonIgnore
    @DBRef(lazy = false)
    private Usuario usuario;

    @JsonIgnore
    @DBRef(lazy = false)
    private Solicitacao solicitacao;

    private String titulo;

    private Tipo tipo;

    @Builder.Default
    private Boolean lida = false;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    public enum Tipo { CHAT, MATCH, WISHLIST, LEMBRETE, AVALIACAO, MODERACAO }
}
