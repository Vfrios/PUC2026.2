package com.reviva.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "solicitacao_id")
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
