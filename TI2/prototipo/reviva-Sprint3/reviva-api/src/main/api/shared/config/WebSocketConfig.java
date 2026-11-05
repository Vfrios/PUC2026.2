package com.reviva.api.config;

import com.reviva.api.security.JwtHandshakeInterceptor;
import com.reviva.api.security.WsAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Chat em tempo real (Doador <-> Receptor) via STOMP sobre WebSocket (com
 * fallback SockJS para redes/proxies que bloqueiam WebSocket puro).
 *
 * O front continua enviando mensagens por REST (POST .../mensagens), que já
 * tem toda a validação de acesso; este canal serve só para EMPURRAR a
 * mensagem recém-criada para quem estiver com o chat aberto, substituindo o
 * polling de ~3,5s por atualização instantânea.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final WsAuthChannelInterceptor wsAuthChannelInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(jwtHandshakeInterceptor)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Tópicos de broadcast: /topic/solicitacoes/{id}
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(wsAuthChannelInterceptor);
    }
}
