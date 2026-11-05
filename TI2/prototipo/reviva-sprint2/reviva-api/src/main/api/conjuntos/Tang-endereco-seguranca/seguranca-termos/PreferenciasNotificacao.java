package com.reviva.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Preferências de notificação da conta, embutidas no documento do usuário. */
@Data
@NoArgsConstructor
public class PreferenciasNotificacao {

    /** Mensagens novas nas conversas. */
    private boolean chat = true;

    /** Publicações nas comunidades que você participa. */
    private boolean comunidades = true;

    public boolean permite(Notificacao.Tipo tipo) {
        if (tipo == null) return true;
        return switch (tipo) {
            case CHAT -> chat;
            case COMUNIDADE -> comunidades;
            default -> false;
        };
    }
}
