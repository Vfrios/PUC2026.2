package com.reviva.api.service;

import com.reviva.api.dto.CidadeResponse;
import com.reviva.api.dto.EnderecoResponse;
import com.reviva.api.dto.EstadoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Geolocalização a partir do CEP (não do CPF: CPF é dado pessoal sensível e
 * não existe API pública/legítima que devolva endereço a partir dele — isso
 * seria uma prática de exposição de dados vedada pela LGPD).
 *
 * Fluxo: ViaCEP (gratuito, sem chave) resolve CEP -> logradouro/bairro/cidade/UF;
 * Nominatim/OpenStreetMap (gratuito, sem chave) resolve esse endereço -> lat/long;
 * IBGE (gratuito, sem chave) popula os selects de Estado/Cidade da tela de busca.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeoService {

    private final RestClient restClient;

    private static final String IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

    // Cache simples em memória: a lista de estados e municípios do IBGE
    // praticamente não muda, então não faz sentido bater na API pública a
    // cada tela de busca aberta pelo usuário.
    private volatile List<EstadoResponse> estadosCache;
    private final Map<String, List<CidadeResponse>> cidadesCachePorUf = new ConcurrentHashMap<>();

    public EnderecoResponse buscarPorCep(String cep) {
        String cepLimpo = cep == null ? "" : cep.replaceAll("\\D", "");
        if (cepLimpo.length() != 8) {
            throw new IllegalArgumentException("CEP inválido: informe 8 dígitos");
        }

        Map<String, Object> viaCep;
        try {
            viaCep = restClient.get()
                    .uri("https://viacep.com.br/ws/{cep}/json/", cepLimpo)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            log.warn("Falha ao consultar ViaCEP para {}: {}", cepLimpo, e.getMessage());
            throw new IllegalArgumentException("Não foi possível consultar o CEP agora");
        }

        if (viaCep == null || Boolean.TRUE.equals(viaCep.get("erro"))) {
            throw new IllegalArgumentException("CEP não encontrado: " + cepLimpo);
        }

        String logradouro = (String) viaCep.getOrDefault("logradouro", "");
        String bairro = (String) viaCep.getOrDefault("bairro", "");
        String cidade = (String) viaCep.getOrDefault("localidade", "");
        String uf = (String) viaCep.getOrDefault("uf", "");

        double[] coords = geocodificar(cidade, uf);

        return new EnderecoResponse(cepLimpo, logradouro, bairro, cidade, uf,
                coords != null ? coords[0] : null, coords != null ? coords[1] : null);
    }

    /** Lista os 27 estados brasileiros (sigla + nome), em ordem alfabética. Cobre os selects de Estado na busca. */
    public List<EstadoResponse> listarEstados() {
        if (estadosCache != null) return estadosCache;
        try {
            List<Map<String, Object>> resultados = restClient.get()
                    .uri(IBGE_BASE + "/estados?orderBy=nome")
                    .retrieve()
                    .body(List.class);

            List<EstadoResponse> estados = resultados == null ? List.of() : resultados.stream()
                    .map(e -> new EstadoResponse((String) e.get("sigla"), (String) e.get("nome")))
                    .toList();
            estadosCache = estados;
            return estados;
        } catch (Exception e) {
            log.warn("Falha ao consultar estados no IBGE: {}", e.getMessage());
            throw new IllegalArgumentException("Não foi possível carregar a lista de estados agora");
        }
    }

    /** Lista os municípios de um estado (UF), em ordem alfabética. Cobre o select de Cidade na busca. */
    public List<CidadeResponse> listarCidades(String uf) {
        String ufNormalizada = uf == null ? "" : uf.trim().toUpperCase();
        if (ufNormalizada.length() != 2) {
            throw new IllegalArgumentException("UF inválida: informe a sigla do estado (ex: MG)");
        }
        List<CidadeResponse> cache = cidadesCachePorUf.get(ufNormalizada);
        if (cache != null) return cache;

        try {
            List<Map<String, Object>> resultados = restClient.get()
                    .uri(IBGE_BASE + "/estados/{uf}/municipios", ufNormalizada)
                    .retrieve()
                    .body(List.class);

            List<CidadeResponse> cidades = resultados == null ? List.of() : resultados.stream()
                    .map(m -> new CidadeResponse((String) m.get("nome")))
                    .sorted((a, b) -> a.nome().compareToIgnoreCase(b.nome()))
                    .toList();
            cidadesCachePorUf.put(ufNormalizada, cidades);
            return cidades;
        } catch (Exception e) {
            log.warn("Falha ao consultar municípios do IBGE para {}: {}", ufNormalizada, e.getMessage());
            throw new IllegalArgumentException("Não foi possível carregar os municípios de " + ufNormalizada + " agora");
        }
    }

    /** Best-effort: se o geocoding falhar, devolvemos o endereço mesmo assim sem lat/long. */
    private double[] geocodificar(String cidade, String uf) {
        if (cidade == null || cidade.isBlank()) return null;
        try {
            List<Map<String, Object>> resultados = restClient.get()
                    .uri(uri -> uri.scheme("https").host("nominatim.openstreetmap.org").path("/search")
                            .queryParam("format", "json")
                            .queryParam("limit", 1)
                            .queryParam("city", cidade)
                            .queryParam("state", uf)
                            .queryParam("country", "Brazil")
                            .build())
                    .retrieve()
                    .body(List.class);

            if (resultados == null || resultados.isEmpty()) return null;
            Map<String, Object> primeiro = resultados.get(0);
            double lat = Double.parseDouble((String) primeiro.get("lat"));
            double lon = Double.parseDouble((String) primeiro.get("lon"));
            return new double[]{lat, lon};
        } catch (Exception e) {
            log.warn("Falha ao geocodificar {}/{}: {}", cidade, uf, e.getMessage());
            return null;
        }
    }
}

