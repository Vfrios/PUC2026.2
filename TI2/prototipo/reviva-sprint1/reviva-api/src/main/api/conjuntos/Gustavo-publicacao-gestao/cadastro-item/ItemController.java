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
import java.util.Map;

/**
 * Publica, edita, consulta e atualiza a disponibilidade dos anúncios da Sprint 1.
 * Retorna DTOs para não expor diretamente as entidades MongoDB.
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
                .titulo(req.titulo().trim())
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
                .pesoKg(req.pesoKg())
                .fotosUrls(req.fotosUrls())
                .modoEntrega(req.modoEntrega())
                .regrasRetirada(req.regrasRetirada())
                .build();
        return ItemResponse.from(itemService.publicar(item));
    }

    @GetMapping
    public List<ItemResponse> buscar(@RequestParam(required = false) Item.Categoria categoria,
                                      @RequestParam(required = false) Item.TipoPublicacao tipo,
                                      @RequestParam(required = false) String termo,
                                      @RequestParam(required = false) String cidade,
                                      @RequestParam(required = false) String uf,
                                      @RequestParam(defaultValue = "true") boolean disponiveis,
                                      @AuthenticationPrincipal Usuario usuario) {
        return ItemResponse.from(itemService.buscar(categoria, tipo, termo, cidade, uf, disponiveis, usuario));
    }

    @GetMapping("/meus")
    public List<ItemResponse> meusItens(@AuthenticationPrincipal Usuario doador) {
        List<Item> itens = itemService.meusItens(doador);
        Map<String, Integer> interessados = itemService.contarInteressados(itens);
        return itens.stream().map(i -> ItemResponse.from(i, interessados.getOrDefault(i.getId(), 0))).toList();
    }

    /** Cobre a tela de Detalhes do Item. */
    @GetMapping("/{id}")
    public ItemResponse buscarPorId(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Item item = itemService.buscarPorId(id, usuario);
        return ItemResponse.from(item, itemService.contarInteressados(item));
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

}
