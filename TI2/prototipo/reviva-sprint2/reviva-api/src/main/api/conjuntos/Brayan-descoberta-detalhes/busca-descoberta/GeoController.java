package com.reviva.api.controller;

import com.reviva.api.dto.EnderecoResponse;
import com.reviva.api.service.GeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


/** Cobre o preenchimento automático do endereço a partir do CEP. */
@RestController
@RequestMapping("/api/geo")
@RequiredArgsConstructor
public class GeoController {

    private final GeoService geoService;

    @GetMapping("/cep/{cep}")
    public EnderecoResponse buscarCep(@PathVariable String cep) {
        return geoService.buscarPorCep(cep);
    }

}

