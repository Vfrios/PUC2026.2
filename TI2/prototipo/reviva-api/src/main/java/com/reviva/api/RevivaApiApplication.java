package com.reviva.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class RevivaApiApplication {
    public static void main(String[] args) {
        // O SQLite cria o arquivo .db sozinho, mas não a pasta que o contém.
        // Garantimos aqui, antes do Spring subir o datasource, pra funcionar
        // em qualquer máquina (sua, dos colegas de grupo, ou no Render).
        new File("db").mkdirs();

        SpringApplication.run(RevivaApiApplication.class, args);
    }
}
