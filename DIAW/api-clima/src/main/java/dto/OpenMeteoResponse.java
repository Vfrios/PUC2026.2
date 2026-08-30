package dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Representa (parcialmente) a resposta da API externa Open-Meteo.
 * Apenas os campos utilizados pela aplicação sao mapeados.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenMeteoResponse {

    private Double latitude;
    private Double longitude;
    private String timezone;

    private Current current;
    private Daily daily;

    // getters e setters

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

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Current getCurrent() {
        return current;
    }

    public void setCurrent(Current current) {
        this.current = current;
    }

    public Daily getDaily() {
        return daily;
    }

    public void setDaily(Daily daily) {
        this.daily = daily;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Current {

        private String time;

        @JsonProperty("temperature_2m")
        private Double temperature;

        @JsonProperty("relative_humidity_2m")
        private Integer humidity;

        @JsonProperty("wind_speed_10m")
        private Double windSpeed;

        @JsonProperty("wind_direction_10m")
        private Integer windDirection;

        @JsonProperty("weather_code")
        private Integer weatherCode;

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public Integer getHumidity() {
            return humidity;
        }

        public void setHumidity(Integer humidity) {
            this.humidity = humidity;
        }

        public Double getWindSpeed() {
            return windSpeed;
        }

        public void setWindSpeed(Double windSpeed) {
            this.windSpeed = windSpeed;
        }

        public Integer getWindDirection() {
            return windDirection;
        }

        public void setWindDirection(Integer windDirection) {
            this.windDirection = windDirection;
        }

        public Integer getWeatherCode() {
            return weatherCode;
        }

        public void setWeatherCode(Integer weatherCode) {
            this.weatherCode = weatherCode;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Daily {

        private List<String> time;

        @JsonProperty("temperature_2m_max")
        private List<Double> temperatureMax;

        @JsonProperty("temperature_2m_min")
        private List<Double> temperatureMin;

        public List<String> getTime() {
            return time;
        }

        public void setTime(List<String> time) {
            this.time = time;
        }

        public List<Double> getTemperatureMax() {
            return temperatureMax;
        }

        public void setTemperatureMax(List<Double> temperatureMax) {
            this.temperatureMax = temperatureMax;
        }

        public List<Double> getTemperatureMin() {
            return temperatureMin;
        }

        public void setTemperatureMin(List<Double> temperatureMin) {
            this.temperatureMin = temperatureMin;
        }
    }
}
