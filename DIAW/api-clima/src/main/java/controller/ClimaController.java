package controller;

import dto.ClimaResponse;
import service.ClimaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/clima")
public class ClimaController {

    private final ClimaService climaService;

    public ClimaController(ClimaService climaService) {
        this.climaService = climaService;
    }

    /**
     * GET /clima
     * Retorna o clima atual de Belo Horizonte - MG (cidade padrao da atividade).
     */
    @GetMapping
    public ClimaResponse clima() {
        return climaService.obterClimaPadrao();
    }

    /**
     * GET /clima/belo-horizonte
     * Endpoint explicito para o clima de Belo Horizonte - MG.
     */
    @GetMapping("/belo-horizonte")
    public ClimaResponse climaBeloHorizonte() {
        return climaService.obterClimaPadrao();
    }

    /**
     * GET /clima/cidade?nome=...&latitude=...&longitude=...
     * Desafio extra: permite consultar o clima de outras cidades,
     * informando nome e coordenadas geograficas.
     */
    @GetMapping("/cidade")
    public ClimaResponse climaPorCidade(
            @RequestParam String nome,
            @RequestParam double latitude,
            @RequestParam double longitude) {
        return climaService.obterClima(nome, latitude, longitude);
    }
}
