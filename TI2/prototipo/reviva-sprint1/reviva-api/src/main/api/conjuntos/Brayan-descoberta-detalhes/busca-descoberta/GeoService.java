package com.reviva.api.service;

import com.reviva.api.dto.EnderecoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Geolocalização a partir do CEP (não do CPF: CPF é dado pessoal sensível e
 * não existe API pública/legítima que devolva endereço a partir dele — isso
 * seria uma prática de exposição de dados vedada pela LGPD).
 *
 * Fluxo: ViaCEP (gratuito, sem chave) resolve CEP -> logradouro/bairro/cidade/UF;
 * Nominatim/OpenStreetMap (gratuito, sem chave) resolve esse endereço -> lat/long.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeoService {

    private final RestClient restClient;

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

        String logradouro = corrigirTexto((String) viaCep.getOrDefault("logradouro", ""));
        String bairro = corrigirTexto((String) viaCep.getOrDefault("bairro", ""));
        String cidade = corrigirTexto((String) viaCep.getOrDefault("localidade", ""));
        String uf = corrigirTexto((String) viaCep.getOrDefault("uf", ""));

        double[] coords = geocodificar(cidade, uf);

        return new EnderecoResponse(cepLimpo, logradouro, bairro, cidade, uf,
                coords != null ? coords[0] : null, coords != null ? coords[1] : null);
    }

    private String corrigirTexto(String valor) {
        if (valor == null || (!valor.contains("Ã") && !valor.contains("Â"))) return valor;
        return new String(valor.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
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
