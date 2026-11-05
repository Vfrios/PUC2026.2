package com.reviva.api.controller;

import com.reviva.api.dto.ComunidadeResponse;
import com.reviva.api.model.Comunidade;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ComunidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/** Cobre: Comunidades e Feed Social (grupos, participação, mural de publicações). */
@RestController
@RequestMapping("/api/comunidades")
@RequiredArgsConstructor
public class ComunidadeController {

    private final ComunidadeRepository comunidadeRepository;

    /** Público; com token, informa se o usuário participa. Filtros opcionais por categoria, cidade/UF e texto. */
    @GetMapping
    public List<ComunidadeResponse> listar(@AuthenticationPrincipal Usuario usuario,
                                           @RequestParam(required = false) String categoria,
                                           @RequestParam(required = false) String cidade,
                                           @RequestParam(required = false) String uf,
                                           @RequestParam(required = false) String termo) {
        String usuarioId = usuario != null ? usuario.getId() : null;
        return comunidadeRepository.findAll().stream()
                .filter(c -> vazio(categoria) || categoria.equalsIgnoreCase(c.getCategoria()))
                .filter(c -> vazio(uf) || uf.equalsIgnoreCase(c.getUf()))
                .filter(c -> vazio(cidade) || contem(c.getCidade(), cidade) || contem(c.getBairroReferencia(), cidade))
                .filter(c -> vazio(termo) || contem(c.getNome(), termo) || contem(c.getDescricao(), termo)
                        || contem(c.getBairroReferencia(), termo))
                .map(c -> ComunidadeResponse.from(c, usuarioId))
                .sorted(Comparator.comparing(ComunidadeResponse::participando).reversed()
                        .thenComparing(ComunidadeResponse::totalMembros, Comparator.reverseOrder()))
                .toList();
    }

    @PostMapping("/{id}/participar")
    public ComunidadeResponse participar(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        c.normalizarMembros();
        c.getMembrosIds().add(usuario.getId());
        return responder(comunidadeRepository.save(c), usuario);
    }

    @PostMapping("/{id}/sair")
    public ComunidadeResponse sair(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        c.normalizarMembros();
        c.getMembrosIds().remove(usuario.getId());
        return responder(comunidadeRepository.save(c), usuario);
    }

    private ComunidadeResponse responder(Comunidade c, Usuario usuario) {
        return ComunidadeResponse.from(c, usuario.getId());
    }

    private Comunidade buscar(String id) {
        return comunidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static boolean contem(String valor, String busca) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(busca.trim().toLowerCase(Locale.ROOT));
    }
}
