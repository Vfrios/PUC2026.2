package com.reviva.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Document("comunidades")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comunidade {

    @Id
    private String id;

    private String nome;

    private String descricao;
    private String bairroReferencia;

    // Evita serializar a coleção de membros diretamente na resposta da comunidade.
    // Use o endpoint específico de membros quando essa lista for necessária.
    @Builder.Default
    @DBRef(lazy = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Usuario> membros = new HashSet<>();
}
