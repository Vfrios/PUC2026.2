package com.reviva.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Path;

@SpringBootApplication
public class RevivaApiApplication {
    public static void main(String[] args) {
        // O SQLite cria o arquivo .db sozinho, mas não a pasta que o contém.
        String databasePath = System.getenv("REVIVA_DB_PATH");
        if (databasePath != null && !databasePath.isBlank()) {
            databasePath = Path.of(databasePath).toAbsolutePath().toString();
        } else {
            Path workingDirectory = Path.of(System.getProperty("user.dir")).toAbsolutePath();
            databasePath = workingDirectory.getFileName().toString().equalsIgnoreCase("reviva-api")
                    ? workingDirectory.resolve("db/reviva.db").toString()
                    : workingDirectory.resolve("reviva-api/db/reviva.db").toString();
        }
        Path databaseFile = Path.of(databasePath);
        if (databaseFile.getParent() != null) databaseFile.getParent().toFile().mkdirs();
        System.setProperty("REVIVA_DB_PATH", databaseFile.toString());

        SpringApplication.run(RevivaApiApplication.class, args);
    }
}
