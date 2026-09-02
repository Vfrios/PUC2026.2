package com.reviva.api.controller;

import com.reviva.api.dto.PresencaEvent;
import com.reviva.api.security.JwtHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
public class PresencaController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, String> usuarioPorSessao = new ConcurrentHashMap<>();
    private final Set<String> sessoesAtivas = ConcurrentHashMap.newKeySet();

    @MessageMapping("/presence/heartbeat")
    public void heartbeat(Message<?> message) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        String sessaoId = accessor.getSessionId();
        String usuarioId = usuarioId(accessor);
        if (sessaoId == null || usuarioId == null) return;

        usuarioPorSessao.put(sessaoId, usuarioId);
        if (sessoesAtivas.add(sessaoId)) {
            messagingTemplate.convertAndSend("/topic/presence", new PresencaEvent(usuarioId, true));
        }
    }

    @EventListener
    public void desconectou(SessionDisconnectEvent event) {
        String usuarioId = usuarioPorSessao.remove(event.getSessionId());
        sessoesAtivas.remove(event.getSessionId());
        if (usuarioId == null || usuarioPorSessao.containsValue(usuarioId)) return;
        messagingTemplate.convertAndSend("/topic/presence", new PresencaEvent(usuarioId, false));
    }

    private String usuarioId(StompHeaderAccessor accessor) {
        Map<String, Object> atributos = accessor.getSessionAttributes();
        return atributos == null ? null : (String) atributos.get(JwtHandshakeInterceptor.ATTR_USUARIO_ID);
    }
}
