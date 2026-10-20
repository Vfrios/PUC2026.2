package com.reviva.api.controller;

import com.reviva.api.security.JwtHandshakeInterceptor;
import com.reviva.api.service.PresencaService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Set;

@Controller
@RequiredArgsConstructor
public class PresencaController {

    private final PresencaService presencaService;

    @MessageMapping("/presence/heartbeat")
    public void heartbeat(StompHeaderAccessor accessor) {
        String sessaoId = accessor.getSessionId();
        String usuarioId = usuarioId(accessor);
        if (sessaoId == null || usuarioId == null) return;
        presencaService.conectar(sessaoId, usuarioId);
    }

    /** Snapshot de quem já está online, respondido só para quem se inscreveu em /app/presence/online. */
    @SubscribeMapping("/presence/online")
    public Set<String> online() {
        return presencaService.online();
    }

    @EventListener
    public void desconectou(SessionDisconnectEvent event) {
        presencaService.desconectar(event.getSessionId());
    }

    private String usuarioId(StompHeaderAccessor accessor) {
        Map<String, Object> atributos = accessor.getSessionAttributes();
        return atributos == null ? null : (String) atributos.get(JwtHandshakeInterceptor.ATTR_USUARIO_ID);
    }
}
