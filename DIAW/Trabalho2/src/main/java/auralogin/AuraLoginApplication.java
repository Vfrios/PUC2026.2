package auralogin;

import auralogin.model.User;
import auralogin.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuraLoginApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraLoginApplication.class, args);
    }

    // Cria um usuario de teste (demo / demo1234) na primeira execucao, so para facilitar os testes.
    @Bean
    CommandLineRunner initDemoUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("demo")) {
                User demo = new User("Usuario Demo", "demo", "demo@auralogin.com",
                        passwordEncoder.encode("demo1234"));
                userRepository.save(demo);
            }
        };
    }
}
