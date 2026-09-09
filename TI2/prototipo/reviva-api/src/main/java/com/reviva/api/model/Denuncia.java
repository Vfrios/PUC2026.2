package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Denúncia/report da tela de Moderação. Pode referenciar um item, chat ou agendamento. */
@Document("denuncias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Denuncia {

    @Id
    private String id;

    @DBRef(lazy = false)
    private Usuario denunciante;

    @DBRef(lazy = false)
    private Usuario denunciado;

    @DBRef(lazy = false)
    private Agendamento agendamento;

    private Motivo motivo;

    private String detalhes;

    @Builder.Default
    private StatusDenuncia status = StatusDenuncia.ABERTA;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    public enum Motivo {
        ITEM_DIVERGENTE, COMPORTAMENTO_INADEQUADO, NAO_COMPARECIMENTO, SUSPEITA_GOLPE, OUTRO
    }
    public enum StatusDenuncia { ABERTA, EM_ANALISE, RESOLVIDA }
}
