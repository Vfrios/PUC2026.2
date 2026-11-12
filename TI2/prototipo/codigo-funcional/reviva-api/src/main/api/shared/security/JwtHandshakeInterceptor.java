package com.reviva.api.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * O handshake inicial do SockJS/WebSocket é feito via HTTP GET comum, mas o
 * navegador não permite anexar o header "Authorization" nele. Por isso o
 * front manda o token como query param (?token=...), e aqui a gente valida
 * e guarda o id do usuário na sessão da conexão, para uso posterior no
 * WsAuthChannelInterceptor (autorização de subscribe).
 */
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ATTR_USUARIO_ID = "usuarioId";

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                    WebSocketHandler wsHandler, Map<String, Object> attributes) {
        List<String> tokenParam = UriComponentsBuilder.fromUri(request.getURI())
                .build().getQueryParams().get("token");

        if (tokenParam == null || tokenParam.isEmpty()) {
            return false; // sem token, recusa a conexão
        }

        String token = tokenParam.get(0);
        if (!jwtService.valido(token)) {
            return false;
        }

        attributes.put(ATTR_USUARIO_ID, jwtService.extrairUsuarioId(token));
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        // nada a fazer
    }
}
