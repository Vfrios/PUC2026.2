package com.reviva.api.service;

import com.reviva.api.dto.AvaliacaoRequest;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AvaliacaoRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontuacaoService pontuacaoService;
    private final NotificacaoService notificacaoService;

    /** Resumo da reputação exibido na tela de Reputação e no perfil público. */
    public record Resumo(double media, int total, Map<String, Double> categorias, Map<Integer, Integer> distribuicao) {}

    @Transactional
    public Avaliacao avaliar(Agendamento agendamento, Usuario avaliador, Usuario avaliado, AvaliacaoRequest req) {
        Solicitacao solicitacao = agendamento.getSolicitacao();
        String doadorId = solicitacao != null && solicitacao.getItem() != null && solicitacao.getItem().getDoador() != null
                ? solicitacao.getItem().getDoador().getId() : null;
        String receptorId = solicitacao != null && solicitacao.getReceptor() != null ? solicitacao.getReceptor().getId() : null;

        boolean avaliadorParticipa = avaliador.getId().equals(doadorId) || avaliador.getId().equals(receptorId);
        boolean avaliadoEhOutraParte = !avaliado.getId().equals(avaliador.getId())
                && (avaliado.getId().equals(doadorId) || avaliado.getId().equals(receptorId));
        if (!avaliadorParticipa || !avaliadoEhOutraParte) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Só quem participou da troca pode avaliar a outra pessoa.");
        }
        if (agendamento.getStatus() == Agendamento.StatusAgendamento.CANCELADO) {
            throw new IllegalArgumentException("Esta troca foi cancelada e não pode ser avaliada.");
        }
        boolean confirmouSuaParte = avaliador.getId().equals(doadorId)
                ? agendamento.getConfirmacaoDoadorEm() != null
                : agendamento.getConfirmacaoReceptorEm() != null;
        if (agendamento.getStatus() != Agendamento.StatusAgendamento.CONCLUIDO && !confirmouSuaParte) {
            throw new IllegalArgumentException("Confirme a retirada antes de avaliar.");
        }
        if (minhaAvaliacao(agendamento.getId(), avaliador).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já avaliou esta troca.");
        }

        Avaliacao avaliacao = avaliacaoRepository.save(Avaliacao.builder()
                .agendamento(agendamento)
                .avaliador(avaliador)
                .avaliado(avaliado)
                .nota(req.nota())
                .pontualidade(req.pontualidade())
                .comunicacao(req.comunicacao())
                .estadoItem(req.estadoItem())
                .comentario(req.comentario() != null ? req.comentario().trim() : null)
                .build());
        recalcularScore(avaliado);
        pontuacaoService.adicionar(usuarioRepository.findById(avaliado.getId()).orElse(avaliado), PontuacaoService.pontosPorAvaliacao(req.nota()));
        notificacaoService.notificar(avaliado, avaliador.getNome() + " avaliou você com " + req.nota() + " estrela(s)", Notificacao.Tipo.AVALIACAO);
        return avaliacao;
    }

    public Optional<Avaliacao> minhaAvaliacao(String agendamentoId, Usuario avaliador) {
        return avaliacaoRepository.findByAgendamento_Id(agendamentoId).stream()
                .filter(a -> a.getAvaliador() != null && avaliador.getId().equals(a.getAvaliador().getId()))
                .findFirst();
    }

    public List<Avaliacao> recebidas(String usuarioId) {
        return avaliacaoRepository.findByAvaliado_IdOrderByCriadaEmDesc(usuarioId);
    }

    public Resumo resumo(List<Avaliacao> avaliacoes) {
        double media = avaliacoes.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
        Map<String, Double> categorias = new LinkedHashMap<>();
        categorias.put("pontualidade", mediaDe(avaliacoes, Avaliacao::getPontualidade));
        categorias.put("comunicacao", mediaDe(avaliacoes, Avaliacao::getComunicacao));
        categorias.put("estadoItem", mediaDe(avaliacoes, Avaliacao::getEstadoItem));
        Map<Integer, Integer> distribuicao = new LinkedHashMap<>();
        for (int n = 5; n >= 1; n--) {
            final int nota = n;
            distribuicao.put(n, (int) avaliacoes.stream().filter(a -> a.getNota() == nota).count());
        }
        return new Resumo(arredondar(media), avaliacoes.size(), categorias, distribuicao);
    }

    private static Double mediaDe(List<Avaliacao> avaliacoes, Function<Avaliacao, Integer> campo) {
        var valores = avaliacoes.stream().map(campo).filter(Objects::nonNull).mapToInt(Integer::intValue);
        var media = valores.average();
        return media.isPresent() ? arredondar(media.getAsDouble()) : null;
    }

    private static double arredondar(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private void recalcularScore(Usuario usuario) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliado_IdOrderByCriadaEmDesc(usuario.getId());
        double media = avaliacoes.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
        usuario.setReputacaoScore(arredondar(media));
        usuarioRepository.save(usuario);
    }
}
