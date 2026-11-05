package com.reviva.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient() {
        // User-Agent exigido pela política de uso do Nominatim/OpenStreetMap.
        return RestClient.builder()
                .defaultHeader("User-Agent", "reviva-api/0.1 (contato@reviva.com)")
                .build();
    }
}
