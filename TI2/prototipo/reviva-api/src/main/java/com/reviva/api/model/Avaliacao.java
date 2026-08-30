package com.reviva.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "avaliacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliador_id")
    private Usuario avaliador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliado_id")
    private Usuario avaliado;

    @Min(1) @Max(5)
    private int nota;

    @Column(length = 1000)
    private String comentario;

    @Builder.Default
    private Instant criadaEm = Instant.now();
}
