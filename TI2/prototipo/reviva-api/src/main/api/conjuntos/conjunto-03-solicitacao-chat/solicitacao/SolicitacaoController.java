package com.reviva.api.controller;

import com.reviva.api.dto.SolicitacaoRequest;
import com.reviva.api.dto.SolicitacaoResponse;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
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
        return solicitacaoService.listarRecebidasComPreview(doador);
    }

    /** Caixa de mensagens: inclui conversas iniciadas ou recebidas pelo usuário. */
    @GetMapping("/conversas")
    public List<SolicitacaoResponse> conversas(@AuthenticationPrincipal Usuario usuario) {
        return solicitacaoService.listarConversasComPreview(usuario);
    }

    /** Solicitações que o usuário logado enviou para itens de outros. */
    @GetMapping("/enviadas")
    public List<SolicitacaoResponse> enviadas(@AuthenticationPrincipal Usuario receptor) {
        return solicitacaoService.listarEnviadasComPreview(receptor);
    }

    /** Abre a solicitação diretamente pelo identificador (somente participantes). */
    @GetMapping("/{id}")
    public SolicitacaoResponse buscar(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        return solicitacaoService.detalhe(solicitacaoService.buscarComAcesso(id, usuario));
    }

    @PostMapping("/{id}/cancelar")
    public SolicitacaoResponse cancelar(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        return solicitacaoService.detalhe(solicitacaoService.cancelar(id, usuario));
    }

    @PostMapping("/{id}/recusar")
    public SolicitacaoResponse recusar(@PathVariable String id, @AuthenticationPrincipal Usuario doador) {
        return solicitacaoService.detalhe(solicitacaoService.recusar(id, doador));
    }
}
