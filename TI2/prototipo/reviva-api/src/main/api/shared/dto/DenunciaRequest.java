package com.reviva.api.dto;

import com.reviva.api.model.Denuncia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DenunciaRequest(
        String usuarioDenunciadoId,
        @NotNull Denuncia.Motivo motivo,
        @Size(max = 2000) String detalhes,
        String itemId,
        String solicitacaoId,
        String agendamentoId) {
}