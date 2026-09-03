package com.reviva.api.model;

import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import jakarta.persistence.*;
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
@Entity
@Table(name = "mensagens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "solicitacao_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Solicitacao solicitacao;

    @ManyToOne(optional = false)
    @JoinColumn(name = "remetente_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Usuario remetente;

    @Column(nullable = false, length = 2000)
    private String texto;

    @Builder.Default
    private Instant criadaEm = Instant.now();
}
