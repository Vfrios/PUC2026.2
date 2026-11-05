package com.reviva.api.controller;

import com.reviva.api.dto.EnderecoRequest;
import com.reviva.api.model.Endereco;
import com.reviva.api.model.Usuario;
import com.reviva.api.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Cobre: Endereço salvo (vários endereços, apelido, endereço padrão). */
@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public List<Endereco> listar(@AuthenticationPrincipal Usuario usuario) {
        return enderecoService.listar(usuario);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Endereco criar(@AuthenticationPrincipal Usuario usuario, @RequestBody @Valid EnderecoRequest req) {
        return enderecoService.criar(usuario, req);
    }

    @PutMapping("/{id}")
    public Endereco atualizar(@AuthenticationPrincipal Usuario usuario, @PathVariable String id,
                              @RequestBody @Valid EnderecoRequest req) {
        return enderecoService.atualizar(usuario, id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Usuario usuario, @PathVariable String id) {
        enderecoService.remover(usuario, id);
    }

    @PostMapping("/{id}/principal")
    public Endereco definirPrincipal(@AuthenticationPrincipal Usuario usuario, @PathVariable String id) {
        return enderecoService.definirPrincipal(usuario, id);
    }
}
