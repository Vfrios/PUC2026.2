package com.reviva.api.controller;

import com.reviva.api.model.Denuncia;
import com.reviva.api.model.Usuario;
import com.reviva.api.service.DenunciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Cobre a tela de Moderação (denúncia/reporte). */
@RestController
@RequestMapping("/api/denuncias")
@RequiredArgsConstructor
public class DenunciaController {

    private final DenunciaService denunciaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Denuncia denunciar(@RequestBody Denuncia denuncia, @AuthenticationPrincipal Usuario denunciante) {
        denuncia.setDenunciante(denunciante);
        return denunciaService.registrar(denuncia);
    }
}
