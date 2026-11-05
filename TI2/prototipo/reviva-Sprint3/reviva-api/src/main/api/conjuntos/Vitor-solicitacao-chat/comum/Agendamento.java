package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Document("agendamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    private String id;

    @DBRef(lazy = false)
    private Solicitacao solicitacao;

    private Instant dataHora;

    private String localEncontro;

    @Builder.Default
    private StatusAgendamento status = StatusAgendamento.CONFIRMADO;

    @Builder.Default
    private Boolean lembrete24hEnviado = false;

    @Builder.Default
    private Boolean lembrete1hEnviado = false;

    private Instant confirmacaoDoadorEm;
    private Instant confirmacaoReceptorEm;
    private Instant confirmacaoAgendamentoReceptorEm;

    @Transient
    public String getCodigoRetirada() {
        return solicitacao != null && solicitacao.getItem() != null
                ? solicitacao.getItem().getQrCodeToken()
                : null;
    }

    public enum StatusAgendamento { CONFIRMADO, CONCLUIDO, CANCELADO, PROBLEMA_REPORTADO }
}
