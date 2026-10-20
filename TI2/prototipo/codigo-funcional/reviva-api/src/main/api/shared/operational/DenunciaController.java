package com.reviva.api.controller;

import com.reviva.api.dto.DenunciaRequest;
import com.reviva.api.model.Denuncia;
import com.reviva.api.model.Usuario;
import com.reviva.api.service.DenunciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Cobre a tela de Moderação (denúncia/reporte). */
@RestController
@RequestMapping("/api/denuncias")
@RequiredArgsConstructor
public class DenunciaController {

    private final DenunciaService denunciaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> denunciar(@RequestBody @Valid DenunciaRequest request, @AuthenticationPrincipal Usuario denunciante) {
        Denuncia denuncia = denunciaService.registrar(request, denunciante);
        return Map.of("id", denuncia.getId(), "status", denuncia.getStatus().name());
    }
}
