package auralogin.controller;

import auralogin.model.User;
import auralogin.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- LOGIN ----------

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                             @RequestParam(value = "logout", required = false) String logout,
                             @RequestParam(value = "registered", required = false) String registered,
                             Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Usuario/email ou senha invalidos.");
        }
        if (logout != null) {
            model.addAttribute("infoMessage", "Sessao encerrada com sucesso.");
        }
        if (registered != null) {
            model.addAttribute("infoMessage", "Cadastro realizado com sucesso! Faca login para continuar.");
        }
        return "login";
    }

    // ---------- CADASTRO ----------

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String fullName,
                            @RequestParam String username,
                            @RequestParam String email,
                            @RequestParam String password,
                            @RequestParam String confirmPassword,
                            Model model) {

        // Mantem os dados preenchidos caso o formulario precise ser reexibido
        model.addAttribute("fullName", fullName);
        model.addAttribute("username", username);
        model.addAttribute("email", email);

        if (fullName.isBlank() || username.isBlank() || email.isBlank()
                || password.isBlank() || confirmPassword.isBlank()) {
            model.addAttribute("errorMessage", "Todos os campos sao obrigatorios.");
            return "register";
        }
        if (!email.matches("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            model.addAttribute("errorMessage", "Informe um email valido.");
            return "register";
        }
        if (!password.equals(confirmPassword)) {
            model.addAttribute("errorMessage", "As senhas nao coincidem.");
            return "register";
        }
        if (password.length() < 6) {
            model.addAttribute("errorMessage", "A senha deve ter no minimo 6 caracteres.");
            return "register";
        }
        if (userRepository.existsByUsername(username)) {
            model.addAttribute("errorMessage", "Este nome de usuario ja esta em uso.");
            return "register";
        }
        if (userRepository.existsByEmail(email)) {
            model.addAttribute("errorMessage", "Este email ja esta cadastrado.");
            return "register";
        }

        User user = new User(fullName, username, email, passwordEncoder.encode(password));
        userRepository.save(user);

        return "redirect:/login?registered";
    }

    // ---------- RECUPERACAO DE SENHA ----------

    @GetMapping("/recoverpassword")
    public String recoverPasswordPage() {
        return "recoverpassword";
    }

    @PostMapping("/recoverpassword")
    public String recoverPassword(@RequestParam String email, Model model) {
        // Nao revela se o email existe ou nao (evita expor dados de usuarios).
        // Aqui a aplicacao apenas simula o envio; para enviar de verdade,
        // integre um servico de email (ex.: JavaMailSender) neste ponto.
        model.addAttribute("infoMessage",
                "Se o email informado estiver cadastrado, enviaremos as instrucoes de recuperacao.");
        return "recoverpassword";
    }
}
