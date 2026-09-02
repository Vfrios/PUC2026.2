package com.reviva.api.service;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo) {
        Notificacao n = Notificacao.builder().usuario(usuario).titulo(titulo).tipo(tipo).build();
        return notificacaoRepository.save(n);
        // Em produção: publicar também via WebSocket/push (FCM/APNs) para o app.
    }

    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo, Solicitacao solicitacao) {
        Notificacao n = Notificacao.builder()
                .usuario(usuario).titulo(titulo).tipo(tipo).solicitacao(solicitacao).build();
        return notificacaoRepository.save(n);
    }

    public List<Notificacao> listar(Usuario usuario) {
        return notificacaoRepository.findByUsuarioOrderByCriadaEmDesc(usuario);
    }

    public long limpar(Usuario usuario) {
        return notificacaoRepository.deleteByUsuario(usuario);
    }

    public long excluirExpiradas(Usuario usuario, int dias) {
        Instant limite = Instant.now().minus(Math.max(1, dias), ChronoUnit.DAYS);
        return notificacaoRepository.deleteByUsuarioAndCriadaEmBefore(usuario, limite);
    }

    public void marcarComoLida(Notificacao notificacao) {
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }
}
