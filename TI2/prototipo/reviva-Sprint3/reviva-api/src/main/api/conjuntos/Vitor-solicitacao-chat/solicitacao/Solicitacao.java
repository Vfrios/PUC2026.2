package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Conversa iniciada por um usuário interessado em um item publicado.
 * A criação já habilita o Chat e, em seguida, o Agendamento.
 */
@Document("solicitacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Solicitacao {

    @Id
    private String id;

    @DBRef(lazy = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Item item;

    @DBRef(lazy = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario receptor;

    /**
     * Id do doador do item, denormalizado para o Inbox funcionar sem join em DBRef.
     * Preenchido na criação e no backfill de listarConversas.
     */
    @Indexed
    private String doadorId;

    private String mensagem;

    @Builder.Default
    private StatusSolicitacao status = StatusSolicitacao.AGUARDANDO;

    @Builder.Default
    private Instant criadaEm = Instant.now();

    /** Usuários que arquivaram a conversa só no próprio Inbox. */
    @Builder.Default
    private List<String> inboxArquivadoPor = new ArrayList<>();

    /** Usuários que excluiram a conversa do próprio Inbox (a troca segue existindo). */
    @Builder.Default
    private List<String> inboxOcultoPor = new ArrayList<>();

    public enum StatusSolicitacao { AGUARDANDO, ACEITA, RECUSADA, CANCELADA }

    public boolean estaArquivadaPara(String usuarioId) {
        return usuarioId != null && inboxArquivadoPor != null && inboxArquivadoPor.contains(usuarioId);
    }

    public boolean estaOcultaPara(String usuarioId) {
        return usuarioId != null && inboxOcultoPor != null && inboxOcultoPor.contains(usuarioId);
    }
}
