package com.reviva.api.controller;

import com.reviva.api.model.Comunidade;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ComunidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Cobre: Comunidades e Feed Social (grupos, participação, ranking). */
@RestController
@RequestMapping("/api/comunidades")
@RequiredArgsConstructor
public class ComunidadeController {

    private final ComunidadeRepository comunidadeRepository;

    @GetMapping
    public List<Comunidade> listar() {
        return comunidadeRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Comunidade criar(@RequestBody Comunidade comunidade) {
        return comunidadeRepository.save(comunidade);
    }

    @PostMapping("/{id}/participar")
    public Comunidade participar(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = comunidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comunidade não encontrada"));
        c.getMembros().add(usuario);
        return comunidadeRepository.save(c);
    }
}
