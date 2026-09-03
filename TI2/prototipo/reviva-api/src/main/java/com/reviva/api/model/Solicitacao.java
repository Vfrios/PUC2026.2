package com.reviva.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.time.Instant;

/**
 * Conversa iniciada por um usuário interessado em um item publicado.
 * A criação já habilita o Chat e, em seguida, o Agendamento.
 */
@Entity
@Table(name = "solicitacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    @NotFound(action = NotFoundAction.IGNORE)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Item item;

    @ManyToOne(optional = false)
    @JoinColumn(name = "receptor_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario receptor;

    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusSolicitacao status = StatusSolicitacao.AGUARDANDO;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    public enum StatusSolicitacao { AGUARDANDO, ACEITA, RECUSADA, CANCELADA }
}
