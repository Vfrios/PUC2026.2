package com.reviva.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.time.Instant;

@Entity
@Table(name = "notificacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "solicitacao_id")
    @NotFound(action = NotFoundAction.IGNORE)
    @JsonIgnore
    private Solicitacao solicitacao;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    @Builder.Default
    private Boolean lida = false;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    public enum Tipo { CHAT, MATCH, WISHLIST, LEMBRETE, AVALIACAO, MODERACAO }
}
