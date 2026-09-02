package com.reviva.api.controller;

import com.reviva.api.dto.SolicitacaoRequest;
import com.reviva.api.dto.SolicitacaoResponse;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.reviva.api.service.SolicitacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cobre: Solicitação de Item e aceite/recusa pelo doador.
 * Retorna sempre SolicitacaoResponse (DTO), nunca a entidade JPA.
 */
@RestController
@RequestMapping("/api/solicitacoes")
@RequiredArgsConstructor
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;
    private final SolicitacaoRepository solicitacaoRepository;
    private final ItemRepository itemRepository;

    @PostMapping
    public SolicitacaoResponse solicitar(@RequestBody @Valid SolicitacaoRequest req, @AuthenticationPrincipal Usuario receptor) {
        Item item = itemRepository.findById(req.itemId())
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado"));
        return SolicitacaoResponse.from(solicitacaoService.solicitar(item, receptor, req.mensagem()));
    }

    /** Conversas em todos os itens publicados pelo usuário logado. */
    @GetMapping("/recebidas")
    public List<SolicitacaoResponse> recebidas(@AuthenticationPrincipal Usuario doador) {
        return SolicitacaoResponse.from(solicitacaoRepository.findByItem_DoadorOrderByCriadaEmDesc(doador));
    }

    /** Caixa de mensagens: inclui conversas iniciadas ou recebidas pelo usuário. */
    @GetMapping("/conversas")
    public List<SolicitacaoResponse> conversas(@AuthenticationPrincipal Usuario usuario) {
        return SolicitacaoResponse.from(
                solicitacaoRepository.findByItem_DoadorOrReceptorOrderByCriadaEmDesc(usuario, usuario));
    }

    /** Solicitações que o usuário logado enviou para itens de outros. */
    @GetMapping("/enviadas")
    public List<SolicitacaoResponse> enviadas(@AuthenticationPrincipal Usuario receptor) {
        return SolicitacaoResponse.from(solicitacaoRepository.findByReceptorOrderByCriadaEmDesc(receptor));
    }
}
