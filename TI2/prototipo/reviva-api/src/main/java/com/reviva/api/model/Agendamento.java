package com.reviva.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "agendamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(optional = false)
    @JoinColumn(name = "solicitacao_id")
    private Solicitacao solicitacao;

    @Column(nullable = false)
    private Instant dataHora;

    private String localEncontro;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusAgendamento status = StatusAgendamento.CONFIRMADO;

    @Builder.Default
    private Boolean lembrete24hEnviado = false;

    @Builder.Default
    private Boolean lembrete1hEnviado = false;

    private Instant confirmacaoDoadorEm;
    private Instant confirmacaoReceptorEm;

    public enum StatusAgendamento { CONFIRMADO, CONCLUIDO, CANCELADO, PROBLEMA_REPORTADO }
}
