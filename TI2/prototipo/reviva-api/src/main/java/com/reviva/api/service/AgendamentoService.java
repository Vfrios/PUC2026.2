package com.reviva.api.service;

import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.reviva.api.service.NotificacaoService;
import com.reviva.api.dto.MensagemResponse;
import com.reviva.api.model.Mensagem;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Cobre as telas "Agendamento", "Confirmação de Doação" e "Confirmação de
 * Recebimento". A confirmação pode ser feita manualmente por cada lado ou
 * via escaneamento do QR Code gerado no item (feature nova em relação ao
 * documento original: fecha o ciclo com 1 toque em vez de 2 confirmações
 * manuais separadas).
 */
@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ItemRepository itemRepository;
    private final PontuacaoService pontuacaoService;
    private final SolicitacaoRepository solicitacaoRepository;
    private final NotificacaoService notificacaoService;
    private final MensagemRepository mensagemRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Agendamento agendar(Solicitacao solicitacao, Usuario usuario, Instant dataHora, String local) {
        if (solicitacao.getStatus() == Solicitacao.StatusSolicitacao.CANCELADA) {
            throw new IllegalArgumentException("Esta troca está cancelada.");
        }
        Agendamento existente = agendamentoRepository.findBySolicitacaoId(solicitacao.getId()).orElse(null);
        if (existente != null) {
            return garantirCodigo(existente);
        }
        List<Agendamento.StatusAgendamento> ativos = List.of(
                Agendamento.StatusAgendamento.CONFIRMADO,
                Agendamento.StatusAgendamento.PROBLEMA_REPORTADO);
        if (!agendamentoRepository.findBySolicitacao_Item_IdAndStatusIn(solicitacao.getItem().getId(), ativos).isEmpty()) {
            throw new IllegalArgumentException("Este item já possui uma troca agendada.");
        }

        Agendamento agendamento = Agendamento.builder()
                .solicitacao(solicitacao)
                .dataHora(dataHora)
                .localEncontro(local)
                .status(Agendamento.StatusAgendamento.CONFIRMADO)
                .build();

        Agendamento salvo = agendamentoRepository.save(agendamento);
        publicarEvento(solicitacao, usuario, String.format(
                "{\"tipo\":\"AGENDAMENTO_CRIADO\",\"dataHora\":\"%s\",\"local\":\"%s\"}",
                dataHora, escapar(local)));
        notificacaoService.notificar(solicitacao.getItem().getDoador(),
            usuario.getNome() + " agendou a retirada do item \""
                + solicitacao.getItem().getTitulo() + "\"",
                com.reviva.api.model.Notificacao.Tipo.CHAT, solicitacao);
        return salvo;
    }

    @Transactional
    public Agendamento garantirCodigo(Agendamento agendamento) {
        return agendamento;
    }

    @Transactional
    public Agendamento gerarCodigo(Agendamento agendamento, Usuario usuario) {
        Solicitacao solicitacao = agendamento.getSolicitacao();
        if (solicitacao.getItem() == null || solicitacao.getItem().getDoador() == null
                || !solicitacao.getItem().getDoador().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Somente o doador pode gerar o código.");
        }
        if (agendamento.getStatus() != Agendamento.StatusAgendamento.CONFIRMADO) {
            throw new IllegalArgumentException("Este agendamento não está aguardando o código.");
        }
        if (agendamento.getConfirmacaoAgendamentoReceptorEm() == null) {
            throw new IllegalArgumentException("Aguarde o receptor confirmar o agendamento.");
        }
        Item item = solicitacao.getItem();
        if (item.getQrCodeToken() == null || item.getQrCodeToken().isBlank()) {
            item.setQrCodeToken(String.valueOf(ThreadLocalRandom.current().nextInt(10000, 100000)));
            itemRepository.save(item);
        }
        return agendamento;
    }

    @Transactional
    public Agendamento confirmarAgendamento(Agendamento agendamento, Usuario usuario) {
        Solicitacao solicitacao = agendamento.getSolicitacao();
        if (solicitacao.getReceptor() == null || !solicitacao.getReceptor().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Somente o receptor pode confirmar o agendamento.");
        }
        if (agendamento.getStatus() != Agendamento.StatusAgendamento.CONFIRMADO) {
            throw new IllegalArgumentException("Este agendamento não está disponível para confirmação.");
        }
        if (agendamento.getConfirmacaoAgendamentoReceptorEm() == null) {
            agendamento.setConfirmacaoAgendamentoReceptorEm(Instant.now());
            agendamento = agendamentoRepository.save(agendamento);
            publicarEvento(solicitacao, usuario, "{\"tipo\":\"AGENDAMENTO_CONFIRMADO\"}");
        }
        return agendamento;
    }

    @Transactional
    public Agendamento confirmarPorDoador(Agendamento agendamento, Usuario usuario) {
        agendamento.setConfirmacaoDoadorEm(Instant.now());
        return finalizarSeAmbosConfirmaram(agendamento, usuario);
    }

    @Transactional
    public Agendamento confirmarPorReceptor(Agendamento agendamento, Usuario usuario) {
        agendamento.setConfirmacaoReceptorEm(Instant.now());
        return finalizarSeAmbosConfirmaram(agendamento, usuario);
    }

    /** Confirmação via escaneamento do QR Code (equivale à confirmação da outra parte). */
    @Transactional
    public Agendamento confirmarPorQrCode(Agendamento agendamento, String tokenEscaneado, Usuario usuario) {
        Item item = agendamento.getSolicitacao().getItem();
        if (item.getQrCodeToken() == null || !item.getQrCodeToken().equals(tokenEscaneado)) {
            throw new IllegalArgumentException("QR Code inválido ou expirado.");
        }
        agendamento.setConfirmacaoDoadorEm(Instant.now());
        agendamento.setConfirmacaoReceptorEm(Instant.now());
        return finalizarSeAmbosConfirmaram(agendamento, usuario);
    }

    private Agendamento finalizarSeAmbosConfirmaram(Agendamento agendamento, Usuario usuario) {
        agendamento = agendamentoRepository.save(agendamento);
        if (agendamento.getConfirmacaoDoadorEm() != null && agendamento.getConfirmacaoReceptorEm() != null) {
            agendamento.setStatus(Agendamento.StatusAgendamento.CONCLUIDO);
            Item item = agendamento.getSolicitacao().getItem();
            item.setStatus(Item.StatusItem.DOADO);
            atualizarImpactoEBadge(item.getDoador(), item.getPesoKg() != null ? item.getPesoKg() : item.getImpactoCo2Kg());
            pontuacaoService.adicionar(item.getDoador(), PontuacaoService.PONTOS_DOACAO_CONCLUIDA);
            pontuacaoService.adicionar(agendamento.getSolicitacao().getReceptor(), PontuacaoService.PONTOS_RECEBIMENTO_CONCLUIDO);
            agendamento = agendamentoRepository.save(agendamento);
            publicarEvento(agendamento.getSolicitacao(), usuario, "{\"tipo\":\"RETIRADA_CONFIRMADA\"}");
        }
        return agendamento;
    }

    private void publicarEvento(Solicitacao solicitacao, Usuario remetente, String texto) {
        Mensagem mensagem = mensagemRepository.save(Mensagem.builder()
                .solicitacao(solicitacao)
                .remetente(remetente)
                .texto(texto)
                .build());
        messagingTemplate.convertAndSend("/topic/solicitacoes/" + solicitacao.getId(), MensagemResponse.from(mensagem));
    }

    private String escapar(String valor) {
        return valor == null ? "" : valor.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    /**
     * Atualiza kg evitados e contagem de itens doados (estatísticas de impacto).
     * O selo (Bronze/Prata/Ouro/Esmeralda) é recalculado à parte, a partir dos
     * pontos, em PontuacaoService — chamado logo depois deste método.
     */
    private void atualizarImpactoEBadge(Usuario doador, Double co2Kg) {
        doador.setItensDoados(doador.getItensDoados() + 1);
        doador.setKgResiduoEvitado(doador.getKgResiduoEvitado() + (co2Kg != null ? co2Kg : 0));
        usuarioRepository.save(doador);
    }

    public void reportarProblema(Agendamento agendamento) {
        agendamento.setStatus(Agendamento.StatusAgendamento.PROBLEMA_REPORTADO);
        agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento cancelar(Agendamento agendamento) {
        if (agendamento.getStatus() == Agendamento.StatusAgendamento.CONCLUIDO) {
            throw new IllegalArgumentException("Uma troca concluída não pode ser cancelada.");
        }
        agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
        Solicitacao solicitacao = agendamento.getSolicitacao();
        solicitacao.setStatus(Solicitacao.StatusSolicitacao.CANCELADA);
        solicitacaoRepository.save(solicitacao);
        return agendamentoRepository.save(agendamento);
    }
}
