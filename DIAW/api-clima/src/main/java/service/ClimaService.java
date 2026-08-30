package service;

import dto.ClimaResponse;
import dto.OpenMeteoResponse;
import exception.ClimaIndisponivelException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ClimaService {

    private final RestTemplate restTemplate;

    @Value("${clima.openmeteo.base-url}")
    private String baseUrl;

    @Value("${clima.default-city}")
    private String cidadePadrao;

    @Value("${clima.default-latitude}")
    private double latitudePadrao;

    @Value("${clima.default-longitude}")
    private double longitudePadrao;

    // Traducao basica dos codigos de tempo (WMO) usados pela Open-Meteo
    private static final Map<Integer, String> CONDICOES_CLIMATICAS = Map.ofEntries(
            Map.entry(0, "Ceu limpo"),
            Map.entry(1, "Predominantemente limpo"),
            Map.entry(2, "Parcialmente nublado"),
            Map.entry(3, "Nublado"),
            Map.entry(45, "Neblina"),
            Map.entry(48, "Neblina com geada"),
            Map.entry(51, "Garoa fraca"),
            Map.entry(53, "Garoa moderada"),
            Map.entry(55, "Garoa forte"),
            Map.entry(61, "Chuva fraca"),
            Map.entry(63, "Chuva moderada"),
            Map.entry(65, "Chuva forte"),
            Map.entry(66, "Chuva congelante fraca"),
            Map.entry(67, "Chuva congelante forte"),
            Map.entry(71, "Neve fraca"),
            Map.entry(73, "Neve moderada"),
            Map.entry(75, "Neve forte"),
            Map.entry(80, "Pancadas de chuva fracas"),
            Map.entry(81, "Pancadas de chuva moderadas"),
            Map.entry(82, "Pancadas de chuva fortes"),
            Map.entry(95, "Trovoada"),
            Map.entry(96, "Trovoada com granizo fraco"),
            Map.entry(99, "Trovoada com granizo forte")
    );

    public ClimaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Retorna o clima atual para a cidade padrao configurada (Belo Horizonte - MG).
     */
    public ClimaResponse obterClimaPadrao() {
        return obterClima(cidadePadrao, latitudePadrao, longitudePadrao);
    }

    /**
     * Retorna o clima atual para as coordenadas informadas.
     * Permite, como desafio extra, consultar outras cidades a partir de latitude/longitude.
     */
    public ClimaResponse obterClima(String nomeCidade, double latitude, double longitude) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code")
                .queryParam("daily", "temperature_2m_max,temperature_2m_min")
                .queryParam("timezone", "America/Sao_Paulo")
                .toUriString();

        OpenMeteoResponse externa;
        try {
            externa = restTemplate.getForObject(url, OpenMeteoResponse.class);
        } catch (RestClientException ex) {
            throw new ClimaIndisponivelException(
                    "Nao foi possivel obter os dados climaticos no momento. Tente novamente mais tarde.", ex);
        }

        if (externa == null || externa.getCurrent() == null) {
            throw new ClimaIndisponivelException("A API externa de clima retornou dados vazios ou invalidos.");
        }

        return montarResposta(nomeCidade, externa);
    }

    private ClimaResponse montarResposta(String nomeCidade, OpenMeteoResponse externa) {
        OpenMeteoResponse.Current current = externa.getCurrent();
        OpenMeteoResponse.Daily daily = externa.getDaily();

        ClimaResponse resposta = new ClimaResponse();
        resposta.setCidade(nomeCidade);
        resposta.setLatitude(externa.getLatitude());
        resposta.setLongitude(externa.getLongitude());
        resposta.setTemperaturaAtual(current.getTemperature());
        resposta.setUmidade(current.getHumidity());
        resposta.setVelocidadeVento(current.getWindSpeed());
        resposta.setDirecaoVento(converterDirecaoVento(current.getWindDirection()));

        String condicao = CONDICOES_CLIMATICAS.getOrDefault(current.getWeatherCode(), "Condicao desconhecida");
        resposta.setCondicaoClimatica(condicao);
        resposta.setDescricao("Tempo " + condicao.toLowerCase() + " em " + nomeCidade + ".");

        if (daily != null && daily.getTemperatureMax() != null && !daily.getTemperatureMax().isEmpty()) {
            resposta.setTemperaturaMaxima(daily.getTemperatureMax().get(0));
        }
        if (daily != null && daily.getTemperatureMin() != null && !daily.getTemperatureMin().isEmpty()) {
            resposta.setTemperaturaMinima(daily.getTemperatureMin().get(0));
        }

        resposta.setConsultadoEm(LocalDateTime.now());
        return resposta;
    }

    private String converterDirecaoVento(Integer graus) {
        if (graus == null) {
            return null;
        }
        String[] direcoes = {"N", "NE", "L", "SE", "S", "SO", "O", "NO"};
        int indice = (int) Math.round(graus / 45.0) % 8;
        return direcoes[indice];
    }
}
