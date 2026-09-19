package com.reviva.api.controller;

import com.reviva.api.dto.CidadeResponse;
import com.reviva.api.dto.EnderecoResponse;
import com.reviva.api.dto.EstadoResponse;
import com.reviva.api.service.GeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Cobre o preenchimento automático de bairro/cidade/coordenadas a partir do CEP,
 *  e os selects de Estado/Cidade da tela de busca (dados públicos do IBGE). */
@RestController
@RequestMapping("/api/geo")
@RequiredArgsConstructor
public class GeoController {

    private final GeoService geoService;

    @GetMapping("/cep/{cep}")
    public EnderecoResponse buscarCep(@PathVariable String cep) {
        return geoService.buscarPorCep(cep);
    }

    @GetMapping("/reverse")
    public EnderecoResponse reverso(@RequestParam double lat, @RequestParam double lon) {
        return geoService.buscarPorCoordenadas(lat, lon);
    }

    @GetMapping("/estados")
    public List<EstadoResponse> estados() {
        return geoService.listarEstados();
    }

    @GetMapping("/estados/{uf}/cidades")
    public List<CidadeResponse> cidades(@PathVariable String uf) {
        return geoService.listarCidades(uf);
    }
}
