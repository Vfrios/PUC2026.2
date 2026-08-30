package com.reviva.api.service;

import com.reviva.api.model.Item;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final ItemRepository itemRepository;
    private final NotificacaoService notificacaoService;

    @Transactional
    public Solicitacao solicitar(Item item, Usuario receptor, String mensagem) {
        Solicitacao solicitacao = Solicitacao.builder()
                .item(item)
                .receptor(receptor)
                .mensagem(mensagem)
                .status(Solicitacao.StatusSolicitacao.AGUARDANDO)
                .build();
        solicitacao = solicitacaoRepository.save(solicitacao);

        item.setStatus(Item.StatusItem.EM_NEGOCIACAO);
        itemRepository.save(item);

        notificacaoService.notificar(item.getDoador(),
                receptor.getNome() + " quer o item \"" + item.getTitulo() + "\"",
                Notificacao.Tipo.MATCH);

        return solicitacao;
    }

    @Transactional
    public Solicitacao aceitar(Solicitacao solicitacao) {
        solicitacao.setStatus(Solicitacao.StatusSolicitacao.ACEITA);
        notificacaoService.notificar(solicitacao.getReceptor(),
                "Sua solicitação para \"" + solicitacao.getItem().getTitulo() + "\" foi aceita!",
                Notificacao.Tipo.CHAT);
        return solicitacaoRepository.save(solicitacao);
    }

    public Solicitacao recusar(Solicitacao solicitacao) {
        solicitacao.setStatus(Solicitacao.StatusSolicitacao.RECUSADA);
        return solicitacaoRepository.save(solicitacao);
    }
}
