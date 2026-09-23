package com.reviva.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Preferências de notificação da conta, embutidas no documento do usuário. */
@Data
@NoArgsConstructor
public class PreferenciasNotificacao {

    /** Mensagens novas nas conversas. */
    private boolean chat = true;

    /** Agendamentos, confirmações e lembretes de retirada. */
    private boolean agendamentos = true;

    /** Avaliações recebidas. */
    private boolean avaliacoes = true;

    /** Publicações nas comunidades que você participa. */
    private boolean comunidades = true;

    /** Sugestões de itens e novidades da plataforma. */
    private boolean novidades = false;

    public boolean permite(Notificacao.Tipo tipo) {
        if (tipo == null) return true;
        return switch (tipo) {
            case CHAT -> chat;
            case LEMBRETE -> agendamentos;
            case AVALIACAO -> avaliacoes;
            case MATCH, WISHLIST -> novidades;
            case COMUNIDADE -> comunidades;
            case MODERACAO -> true;
        };
    }
}
