package com.example.CandidatosTSE.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// scanBasePackages é necessário porque controller/service/model ficam
// em pacotes irmãos de "application" (e não abaixo dele).
@SpringBootApplication(scanBasePackages = "com.example.CandidatosTSE")
public class CandidatosTseApplication {

    public static void main(String[] args) {
        SpringApplication.run(CandidatosTseApplication.class, args);
    }
}
