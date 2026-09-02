package com.reviva.api.service;

import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

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

    @Transactional
    public Agendamento agendar(Solicitacao solicitacao, Instant dataHora, String local) {
        Agendamento existente = agendamentoRepository.findBySolicitacaoId(solicitacao.getId()).orElse(null);
        if (existente != null) return existente;

        Agendamento agendamento = Agendamento.builder()
                .solicitacao(solicitacao)
                .dataHora(dataHora)
                .localEncontro(local)
                .status(Agendamento.StatusAgendamento.CONFIRMADO)
                .build();

        // gera o token de QR Code que o item exibirá para o receptor escanear,
        // e salva explicitamente o item (sem isso o token não persistia no banco)
        Item item = solicitacao.getItem();
        item.setQrCodeToken(UUID.randomUUID().toString());
        itemRepository.save(item);

        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento confirmarPorDoador(Agendamento agendamento) {
        agendamento.setConfirmacaoDoadorEm(Instant.now());
        return finalizarSeAmbosConfirmaram(agendamento);
    }

    @Transactional
    public Agendamento confirmarPorReceptor(Agendamento agendamento) {
        agendamento.setConfirmacaoReceptorEm(Instant.now());
        return finalizarSeAmbosConfirmaram(agendamento);
    }

    /** Confirmação via escaneamento do QR Code (equivale à confirmação da outra parte). */
    @Transactional
    public Agendamento confirmarPorQrCode(Agendamento agendamento, String tokenEscaneado) {
        Item item = agendamento.getSolicitacao().getItem();
        if (item.getQrCodeToken() == null || !item.getQrCodeToken().equals(tokenEscaneado)) {
            throw new IllegalArgumentException("QR Code inválido ou expirado.");
        }
        agendamento.setConfirmacaoDoadorEm(Instant.now());
        agendamento.setConfirmacaoReceptorEm(Instant.now());
        return finalizarSeAmbosConfirmaram(agendamento);
    }

    private Agendamento finalizarSeAmbosConfirmaram(Agendamento agendamento) {
        agendamento = agendamentoRepository.save(agendamento);
        if (agendamento.getConfirmacaoDoadorEm() != null && agendamento.getConfirmacaoReceptorEm() != null) {
            agendamento.setStatus(Agendamento.StatusAgendamento.CONCLUIDO);
            Item item = agendamento.getSolicitacao().getItem();
            item.setStatus(Item.StatusItem.DOADO);
            atualizarImpactoEBadge(item.getDoador(), item.getPesoKg() != null ? item.getPesoKg() : item.getImpactoCo2Kg());
            pontuacaoService.adicionar(item.getDoador(), PontuacaoService.PONTOS_DOACAO_CONCLUIDA);
            pontuacaoService.adicionar(agendamento.getSolicitacao().getReceptor(), PontuacaoService.PONTOS_RECEBIMENTO_CONCLUIDO);
            agendamento = agendamentoRepository.save(agendamento);
        }
        return agendamento;
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
}
