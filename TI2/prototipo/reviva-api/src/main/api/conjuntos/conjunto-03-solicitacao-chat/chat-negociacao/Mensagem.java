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
 *
 * Status de entrega no estilo WhatsApp:
 * - enviada (salva): entregue=false, lida=false → 1 check
 * - entregue no aparelho do destinatário: entregue=true → 2 checks cinza
 * - lida pelo destinatário: lida=true → 2 checks azuis
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

    /** Destinatário recebeu a mensagem no aparelho (duplo check cinza). */
    @Builder.Default
    private Boolean entregue = false;

    /** Destinatário abriu/leu a conversa (duplo check azul). */
    @Builder.Default
    private Boolean lida = false;
}
