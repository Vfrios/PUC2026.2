package com.reviva.api.service;

import com.reviva.api.dto.CidadeResponse;
import com.reviva.api.dto.EnderecoResponse;
import com.reviva.api.dto.EstadoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static java.util.Map.entry;

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

    // Nominatim devolve o nome por extenso do estado ("Minas Gerais"), mas os
    // selects de Estado/Cidade da busca trabalham com a sigla (ver listarEstados
    // acima e o value dos <option> no front) — esse mapa faz essa conversão.
    private static final Map<String, String> NOME_ESTADO_PARA_UF = Map.ofEntries(
            entry("Acre", "AC"), entry("Alagoas", "AL"), entry("Amapá", "AP"), entry("Amazonas", "AM"),
            entry("Bahia", "BA"), entry("Ceará", "CE"), entry("Distrito Federal", "DF"), entry("Espírito Santo", "ES"),
            entry("Goiás", "GO"), entry("Maranhão", "MA"), entry("Mato Grosso", "MT"), entry("Mato Grosso do Sul", "MS"),
            entry("Minas Gerais", "MG"), entry("Pará", "PA"), entry("Paraíba", "PB"), entry("Paraná", "PR"),
            entry("Pernambuco", "PE"), entry("Piauí", "PI"), entry("Rio de Janeiro", "RJ"), entry("Rio Grande do Norte", "RN"),
            entry("Rio Grande do Sul", "RS"), entry("Rondônia", "RO"), entry("Roraima", "RR"), entry("Santa Catarina", "SC"),
            entry("São Paulo", "SP"), entry("Sergipe", "SE"), entry("Tocantins", "TO")
    );

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

    /** Geolocalização automática: a partir das coordenadas do GPS/navegador do
     *  usuário (tela de Busca), descobre em qual cidade/UF ele está, para
     *  pré-preencher a região e já filtrar os itens por perto sem digitação. */
    @SuppressWarnings("unchecked")
    public EnderecoResponse buscarPorCoordenadas(double latitude, double longitude) {
        try {
            Map<String, Object> resultado = restClient.get()
                    .uri(uri -> uri.scheme("https").host("nominatim.openstreetmap.org").path("/reverse")
                            .queryParam("format", "json")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .queryParam("zoom", 10)
                            .queryParam("addressdetails", 1)
                            .build())
                    .retrieve()
                    .body(Map.class);

            Map<String, Object> address = resultado != null ? (Map<String, Object>) resultado.get("address") : null;
            if (address == null) {
                throw new IllegalArgumentException("Não foi possível determinar sua localização");
            }

            String cidade = primeiroNaoNulo(address.get("city"), address.get("town"), address.get("village"),
                    address.get("municipality"), address.get("county"));
            String bairro = primeiroNaoNulo(address.get("suburb"), address.get("neighbourhood"));
            String nomeEstado = (String) address.get("state");
            String uf = nomeEstado != null ? NOME_ESTADO_PARA_UF.getOrDefault(nomeEstado, "") : "";

            return new EnderecoResponse(null, null, bairro, cidade, uf, latitude, longitude);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Falha ao reverse-geocodificar {}/{}: {}", latitude, longitude, e.getMessage());
            throw new IllegalArgumentException("Não foi possível determinar sua localização agora");
        }
    }

    private String primeiroNaoNulo(Object... valores) {
        for (Object v : valores) {
            if (v instanceof String s && !s.isBlank()) return s;
        }
        return null;
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
