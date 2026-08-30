package com.reviva.api.service;

import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AvaliacaoRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontuacaoService pontuacaoService;

    @Transactional
    public Avaliacao avaliar(Agendamento agendamento, Usuario avaliador, Usuario avaliado, int nota, String comentario) {
        Avaliacao avaliacao = Avaliacao.builder()
                .agendamento(agendamento)
                .avaliador(avaliador)
                .avaliado(avaliado)
                .nota(nota)
                .comentario(comentario)
                .build();
        avaliacao = avaliacaoRepository.save(avaliacao);
        recalcularScore(avaliado);
        pontuacaoService.adicionar(avaliado, PontuacaoService.pontosPorAvaliacao(nota));
        return avaliacao;
    }

    private void recalcularScore(Usuario usuario) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliado(usuario);
        double media = avaliacoes.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
        usuario.setReputacaoScore(Math.round(media * 100.0) / 100.0);
        usuarioRepository.save(usuario);
    }
}
