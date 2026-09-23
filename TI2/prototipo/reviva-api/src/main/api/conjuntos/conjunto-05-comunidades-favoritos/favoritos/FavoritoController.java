package com.reviva.api.controller;

import com.reviva.api.dto.ItemResponse;
import com.reviva.api.model.Favorito;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.FavoritoRepository;
import com.reviva.api.repository.ItemRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Cobre: Favoritos (itens salvos, persistidos por usuário). */
@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoRepository favoritoRepository;
    private final ItemRepository itemRepository;

    /** item é null quando o anúncio foi apagado; o app mostra como indisponível. */
    public record FavoritoResponse(String itemId, Instant salvoEm, boolean disponivel, ItemResponse item) {}

    public record RemoverRequest(@NotEmpty List<String> itemIds) {}

    @GetMapping
    public List<FavoritoResponse> listar(@AuthenticationPrincipal Usuario usuario) {
        List<Favorito> favoritos = favoritoRepository.findByUsuarioIdOrderBySalvoEmDesc(usuario.getId());
        Map<String, Item> itens = itemRepository.findAllById(favoritos.stream().map(Favorito::getItemId).toList())
                .stream().collect(Collectors.toMap(Item::getId, Function.identity()));
        return favoritos.stream().map(f -> {
            Item item = itens.get(f.getItemId());
            boolean disponivel = item != null && item.getStatus() == Item.StatusItem.ATIVO
                    && (item.getExpiraEm() == null || item.getExpiraEm().isAfter(Instant.now()));
            return new FavoritoResponse(f.getItemId(), f.getSalvoEm(), disponivel,
                    item != null ? ItemResponse.from(item) : null);
        }).toList();
    }

    @PostMapping("/{itemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FavoritoResponse adicionar(@PathVariable String itemId, @AuthenticationPrincipal Usuario usuario) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado"));
        Favorito f = favoritoRepository.findByUsuarioIdAndItemId(usuario.getId(), itemId)
                .orElseGet(() -> favoritoRepository.save(Favorito.builder().usuarioId(usuario.getId()).itemId(itemId).build()));
        return new FavoritoResponse(itemId, f.getSalvoEm(), item.getStatus() == Item.StatusItem.ATIVO, ItemResponse.from(item));
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable String itemId, @AuthenticationPrincipal Usuario usuario) {
        favoritoRepository.deleteByUsuarioIdAndItemId(usuario.getId(), itemId);
    }

    @PostMapping("/remover")
    public Map<String, Long> removerEmLote(@RequestBody @Valid RemoverRequest req, @AuthenticationPrincipal Usuario usuario) {
        return Map.of("removidos", favoritoRepository.deleteByUsuarioIdAndItemIdIn(usuario.getId(), req.itemIds()));
    }
}
