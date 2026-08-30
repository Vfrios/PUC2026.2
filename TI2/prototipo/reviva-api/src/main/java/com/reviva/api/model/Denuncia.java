package com.reviva.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Denúncia/report da tela de Moderação. Pode referenciar um item, chat ou agendamento. */
@Entity
@Table(name = "denuncias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "denunciante_id")
    private Usuario denunciante;

    @ManyToOne
    @JoinColumn(name = "denunciado_id")
    private Usuario denunciado;

    @ManyToOne
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @Enumerated(EnumType.STRING)
    private Motivo motivo;

    @Column(length = 1000)
    private String detalhes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusDenuncia status = StatusDenuncia.ABERTA;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    public enum Motivo {
        ITEM_DIVERGENTE, COMPORTAMENTO_INADEQUADO, NAO_COMPARECIMENTO, SUSPEITA_GOLPE, OUTRO
    }
    public enum StatusDenuncia { ABERTA, EM_ANALISE, RESOLVIDA }
}
