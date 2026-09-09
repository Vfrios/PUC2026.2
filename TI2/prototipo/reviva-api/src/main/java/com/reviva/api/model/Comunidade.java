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

    // LAZY por padrão em @ManyToMany + open-in-view=false: sem @JsonIgnore
    // aqui o Jackson tentava ler a coleção fora da sessão do Hibernate e
    // quebrava a resposta no meio (mesmo bug do ERR_INCOMPLETE_CHUNKED_ENCODING
    // relatado nas outras rotas). Use GET /api/comunidades/{id}/membros (a criar
    // se precisar da lista) em vez de expor isso aqui.
    @Builder.Default
    @DBRef(lazy = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Usuario> membros = new HashSet<>();
}
