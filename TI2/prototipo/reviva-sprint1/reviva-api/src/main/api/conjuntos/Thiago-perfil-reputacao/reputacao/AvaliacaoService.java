package com.reviva.api.service;

import com.reviva.api.model.Avaliacao;
import com.reviva.api.repository.AvaliacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;

    /** Resumo da reputação exibido na tela de Reputação e no perfil público. */
    public record Resumo(double media, int total, Map<String, Double> categorias, Map<Integer, Integer> distribuicao) {}

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
}
