package com.reviva.api.service;

import com.reviva.api.model.Usuario;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Centraliza as regras de pontuação e progressão de selo do Reviva.
 *
 * Cada ação relevante do usuário soma pontos; o total acumulado (Usuario.pontos)
 * é o que determina o selo atual (Bronze/Prata/Ouro/Esmeralda), exibido no
 * Dashboard de Impacto e na tela de Reputação. Isso substitui a lógica antiga,
 * que calculava o selo apenas pela contagem de itens doados.
 */
@Service
@RequiredArgsConstructor
public class PontuacaoService {

    private final UsuarioRepository usuarioRepository;

    /** Pontos ganhos pelo doador ao concluir a entrega de um item. */
    public static final int PONTOS_DOACAO_CONCLUIDA = 15;

    /** Pontos ganhos pelo receptor ao confirmar o recebimento de um item. */
    public static final int PONTOS_RECEBIMENTO_CONCLUIDO = 5;

    /** Pontos bônus por avaliação recebida, de acordo com a nota (1 a 5). */
    public static int pontosPorAvaliacao(int nota) {
        return switch (nota) {
            case 5 -> 10;
            case 4 -> 5;
            case 3 -> 1;
            default -> 0; // notas 1 e 2 não geram pontos, mas também não descontam
        };
    }

    // Limiares de pontos para cada selo. Ajustável sem tocar no resto do código.
    private static final int LIMIAR_PRATA = 50;
    private static final int LIMIAR_OURO = 150;
    private static final int LIMIAR_ESMERALDA = 350;

    /** Soma pontos ao usuário, recalcula o selo e persiste. */
    @Transactional
    public Usuario adicionar(Usuario usuario, int pontos) {
        if (pontos == 0) return usuario;
        usuario.setPontos(usuario.getPontos() + pontos);
        usuario.setSeloAtual(calcularSelo(usuario.getPontos()));
        return usuarioRepository.save(usuario);
    }

    private Usuario.SeloTier calcularSelo(int pontos) {
        if (pontos >= LIMIAR_ESMERALDA) return Usuario.SeloTier.ESMERALDA;
        if (pontos >= LIMIAR_OURO) return Usuario.SeloTier.OURO;
        if (pontos >= LIMIAR_PRATA) return Usuario.SeloTier.PRATA;
        return Usuario.SeloTier.BRONZE;
    }
}
