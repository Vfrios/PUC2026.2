package com.reviva.api.dto;

import com.reviva.api.model.Mensagem;

import java.time.Instant;
import java.util.List;

/** DTO de mensagem sem devolver as entidades relacionadas. */
public record MensagemResponse(
        String id,
        UsuarioResumo remetente,
        String texto,
        Instant criadaEm
) {
    public static MensagemResponse from(Mensagem mensagem) {
        return new MensagemResponse(
                mensagem.getId(),
                mensagem.getRemetente() == null ? null : new UsuarioResumo(
                        mensagem.getRemetente().getId(),
                        mensagem.getRemetente().getNome(),
                        mensagem.getRemetente().getFotoUrl()),
                mensagem.getTexto(),
                mensagem.getCriadaEm());
    }

    public static List<MensagemResponse> from(List<Mensagem> mensagens) {
        return mensagens.stream().map(MensagemResponse::from).toList();
    }

    public record UsuarioResumo(String id, String nome, String fotoUrl) {}
}
