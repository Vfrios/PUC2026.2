package dto;

import java.time.LocalDateTime;

/**
 * Objeto de resposta proprio da aplicacao com as informacoes
 * climaticas ja processadas para o cliente da API.
 */
public class ClimaResponse {

    private String cidade;
    private Double latitude;
    private Double longitude;
    private Double temperaturaAtual;
    private Double temperaturaMaxima;
    private Double temperaturaMinima;
    private Integer umidade;
    private Double velocidadeVento;
    private String direcaoVento;
    private String condicaoClimatica;
    private String descricao;
    private LocalDateTime consultadoEm;

    public ClimaResponse() {
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getTemperaturaAtual() {
        return temperaturaAtual;
    }

    public void setTemperaturaAtual(Double temperaturaAtual) {
        this.temperaturaAtual = temperaturaAtual;
    }

    public Double getTemperaturaMaxima() {
        return temperaturaMaxima;
    }

    public void setTemperaturaMaxima(Double temperaturaMaxima) {
        this.temperaturaMaxima = temperaturaMaxima;
    }

    public Double getTemperaturaMinima() {
        return temperaturaMinima;
    }

    public void setTemperaturaMinima(Double temperaturaMinima) {
        this.temperaturaMinima = temperaturaMinima;
    }

    public Integer getUmidade() {
        return umidade;
    }

    public void setUmidade(Integer umidade) {
        this.umidade = umidade;
    }

    public Double getVelocidadeVento() {
        return velocidadeVento;
    }

    public void setVelocidadeVento(Double velocidadeVento) {
        this.velocidadeVento = velocidadeVento;
    }

    public String getDirecaoVento() {
        return direcaoVento;
    }

    public void setDirecaoVento(String direcaoVento) {
        this.direcaoVento = direcaoVento;
    }

    public String getCondicaoClimatica() {
        return condicaoClimatica;
    }

    public void setCondicaoClimatica(String condicaoClimatica) {
        this.condicaoClimatica = condicaoClimatica;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getConsultadoEm() {
        return consultadoEm;
    }

    public void setConsultadoEm(LocalDateTime consultadoEm) {
        this.consultadoEm = consultadoEm;
    }
}
