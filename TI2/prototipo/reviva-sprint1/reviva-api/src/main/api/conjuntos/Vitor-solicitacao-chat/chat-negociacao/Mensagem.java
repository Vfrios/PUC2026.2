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
 * Solicitação (cobre a tela de chat por REST com consulta periódica no frontend).
 *
 * A leitura do histórico marca mensagens recebidas como entregues e lidas.
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

    /** Mensagem retornada ao destinatário pelo endpoint do histórico. */
    @Builder.Default
    private Boolean entregue = false;

    /** Destinatário abriu/leu a conversa (duplo check azul). */
    @Builder.Default
    private Boolean lida = false;
}
