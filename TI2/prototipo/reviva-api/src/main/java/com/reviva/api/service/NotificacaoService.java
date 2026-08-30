package com.reviva.api.service;

import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public Notificacao notificar(Usuario usuario, String titulo, Notificacao.Tipo tipo) {
        Notificacao n = Notificacao.builder().usuario(usuario).titulo(titulo).tipo(tipo).build();
        return notificacaoRepository.save(n);
        // Em produção: publicar também via WebSocket/push (FCM/APNs) para o app.
    }

    public List<Notificacao> listar(Usuario usuario) {
        return notificacaoRepository.findByUsuarioOrderByCriadaEmDesc(usuario);
    }

    public void marcarComoLida(Notificacao notificacao) {
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }
}
