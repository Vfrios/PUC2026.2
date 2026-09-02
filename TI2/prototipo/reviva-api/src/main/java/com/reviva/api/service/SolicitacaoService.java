package com.reviva.api.service;

import com.reviva.api.model.Item;
import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final MensagemRepository mensagemRepository;
    private final NotificacaoService notificacaoService;

    @Transactional
    public Solicitacao solicitar(Item item, Usuario receptor, String mensagem) {
        Solicitacao solicitacao = Solicitacao.builder()
                .item(item)
                .receptor(receptor)
                .mensagem(mensagem)
                .status(Solicitacao.StatusSolicitacao.ACEITA)
                .build();
        solicitacao = solicitacaoRepository.save(solicitacao);

        if (mensagem != null && !mensagem.isBlank()) {
            mensagemRepository.save(Mensagem.builder()
                    .solicitacao(solicitacao)
                    .remetente(receptor)
                    .texto(mensagem)
                    .build());
        }

        notificacaoService.notificar(item.getDoador(),
                receptor.getNome() + " enviou uma mensagem sobre \"" + item.getTitulo() + "\"",
            Notificacao.Tipo.CHAT, solicitacao);

        return solicitacao;
    }

}
