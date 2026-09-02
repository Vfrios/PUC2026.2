package com.reviva.api.security;

import com.reviva.api.model.Solicitacao;
import com.reviva.api.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

/**
 * Garante que só o doador do item ou o receptor da solicitação consigam se
 * inscrever no tópico /topic/solicitacoes/{id} — mesma regra de acesso já
 * aplicada em MensagemController, só que para o canal de tempo real.
 */
@Component
@RequiredArgsConstructor
public class WsAuthChannelInterceptor implements ChannelInterceptor {

    private final SolicitacaoRepository solicitacaoRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destino = accessor.getDestination();
            String usuarioId = (String) accessor.getSessionAttributes().get(JwtHandshakeInterceptor.ATTR_USUARIO_ID);

            if (destino == null || usuarioId == null) {
                throw new IllegalArgumentException("Inscrição não permitida.");
            }

            if ("/topic/presence".equals(destino)) return message;
            if (!destino.startsWith("/topic/solicitacoes/")) {
                throw new IllegalArgumentException("Inscrição não permitida.");
            }

            String solicitacaoId = destino.substring("/topic/solicitacoes/".length());
            Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                    .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada."));

            boolean ehDoador = solicitacao.getItem().getDoador().getId().equals(usuarioId);
            boolean ehReceptor = solicitacao.getReceptor().getId().equals(usuarioId);
            if (!ehDoador && !ehReceptor) {
                throw new IllegalArgumentException("Você não participa desta conversa.");
            }
        }

        return message;
    }
}
