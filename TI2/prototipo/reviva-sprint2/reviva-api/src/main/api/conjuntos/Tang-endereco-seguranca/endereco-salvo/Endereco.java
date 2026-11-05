package com.reviva.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Endereço salvo pelo usuário (casa, trabalho, ponto de encontro...). */
@Document("enderecos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    @Id
    private String id;

    @Indexed
    private String usuarioId;

    private String apelido;
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private boolean principal = false;

    @Builder.Default
    private Instant criadoEm = Instant.now();
}
