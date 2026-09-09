package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Mensagem de chat trocada entre Doador e Receptor no contexto de uma
 * Solicitação (cobre a tela de Chat). Simples e via REST (poll no front);
 * ver README para o caminho de evolução para WebSocket/STOMP.
 */
@Document("mensagens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mensagem {

    @Id
    private String id;

    @DBRef(lazy = false)
    private Solicitacao solicitacao;

    @DBRef(lazy = false)
    private Usuario remetente;

    private String texto;

    @Builder.Default
    private Instant criadaEm = Instant.now();
}
