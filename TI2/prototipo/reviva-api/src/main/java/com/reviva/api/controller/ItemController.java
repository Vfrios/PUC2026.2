package com.reviva.api.controller;

import com.reviva.api.dto.ItemRequest;
import com.reviva.api.dto.ItemResponse;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cobre as telas: Cadastro de Item, Gerenciar Itens, Busca de Itens,
 * Lista de Itens, Mapa de Itens e Detalhes do Item.
 * Retorna sempre ItemResponse (DTO) e nunca a entidade JPA — evita
 * LazyInitializationException / ciclo de serialização (ERR_INCOMPLETE_CHUNKED_ENCODING).
 */
@RestController
@RequestMapping("/api/itens")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse cadastrar(@RequestBody @Valid ItemRequest req, @AuthenticationPrincipal Usuario doador) {
        Item item = Item.builder()
                .doador(doador)
                .titulo(req.titulo())
                .descricao(req.descricao())
                .categoria(req.categoria())
                .estadoConservacao(req.estadoConservacao())
                .tipoPublicacao(req.tipoPublicacao())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .cep(req.cep())
                .numero(req.numero())
                .complemento(req.complemento())
                .bairro(req.bairro())
                .cidade(req.cidade())
                .uf(req.uf())
                .impactoCo2Kg(req.impactoCo2Kg())
                .fotosUrls(req.fotosUrls())
                .build();
        return ItemResponse.from(itemService.publicar(item));
    }

    @GetMapping
    public List<ItemResponse> buscar(@RequestParam(required = false) Item.Categoria categoria,
                                      @RequestParam(required = false) Item.TipoPublicacao tipo,
                                      @RequestParam(required = false) String termo,
                                      @RequestParam(required = false) String cidade,
                                      @RequestParam(required = false) String uf) {
        return ItemResponse.from(itemService.buscar(categoria, tipo, termo, cidade, uf));
    }

    @GetMapping("/meus")
    public List<ItemResponse> meusItens(@AuthenticationPrincipal Usuario doador) {
        return ItemResponse.from(itemService.meusItens(doador));
    }

    /** Cobre a tela de Detalhes do Item. */
    @GetMapping("/{id}")
    public ItemResponse buscarPorId(@PathVariable String id) {
        return ItemResponse.from(itemService.buscarPorId(id));
    }

    /** Cobre a edição do anúncio em "Gerenciar itens" — renova o prazo de validade. */
    @PutMapping("/{id}")
    public ItemResponse editar(@PathVariable String id, @RequestBody @Valid ItemRequest req, @AuthenticationPrincipal Usuario doador) {
        return ItemResponse.from(itemService.editar(id, req, doador));
    }

    @PostMapping("/{id}/doado")
    public ItemResponse marcarComoDoado(@PathVariable String id, @AuthenticationPrincipal Usuario doador) {
        return ItemResponse.from(itemService.marcarComoDoado(id, doador));
    }

    @DeleteMapping("/{id}")
    public ItemResponse remover(@PathVariable String id, @AuthenticationPrincipal Usuario doador) {
        return ItemResponse.from(itemService.remover(id, doador));
    }

    @PostMapping("/{id}/restaurar")
    public ItemResponse restaurar(@PathVariable String id, @AuthenticationPrincipal Usuario doador) {
        return ItemResponse.from(itemService.restaurar(id, doador));
    }
}
