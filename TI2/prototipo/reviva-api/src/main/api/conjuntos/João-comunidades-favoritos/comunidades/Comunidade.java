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

import java.time.Instant;
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

    /** Tema principal: ROUPAS, MOVEIS, ELETRONICOS, LIVROS, INFANTIL, GERAL... */
    private String categoria;
    private String cidade;
    private String uf;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    /** Ids dos participantes. Substitui a lista de DBRef, cuja comparação por igualdade não era confiável. */
    @Builder.Default
    @JsonIgnore
    private Set<String> membrosIds = new HashSet<>();

    // Formato antigo (mantido só para leitura de dados já gravados).
    @Builder.Default
    @DBRef(lazy = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Usuario> membros = new HashSet<>();

    /** Une os participantes do formato antigo e do novo. */
    public Set<String> idsDosMembros() {
        Set<String> ids = new HashSet<>(membrosIds != null ? membrosIds : Set.of());
        if (membros != null) {
            membros.stream().filter(u -> u != null && u.getId() != null).forEach(u -> ids.add(u.getId()));
        }
        return ids;
    }

    /** Converte para o formato novo, descartando a lista de DBRef. */
    public void normalizarMembros() {
        membrosIds = idsDosMembros();
        membros = new HashSet<>();
    }
}
