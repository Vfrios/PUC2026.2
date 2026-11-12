package com.reviva.api.controller;

import com.reviva.api.model.Usuario;
import com.reviva.api.service.BloqueioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios/me/bloqueados")
@RequiredArgsConstructor
public class BloqueioController {

    private final BloqueioService bloqueioService;

    @GetMapping
    public List<BloqueioService.UsuarioBloqueado> listar(@AuthenticationPrincipal Usuario usuario) {
        return bloqueioService.listar(usuario);
    }

    @PostMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void bloquear(@PathVariable String usuarioId, @AuthenticationPrincipal Usuario usuario) {
        bloqueioService.bloquear(usuario, usuarioId);
    }

    @DeleteMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desbloquear(@PathVariable String usuarioId, @AuthenticationPrincipal Usuario usuario) {
        bloqueioService.desbloquear(usuario, usuarioId);
    }
}