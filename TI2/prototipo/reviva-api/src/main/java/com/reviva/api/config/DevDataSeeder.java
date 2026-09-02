package com.reviva.api.config;

import com.reviva.api.model.Comunidade;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ComunidadeRepository;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Popula o banco H2 com dados de demonstração ao subir a aplicação em modo
 * dev, para você já abrir o front e ver algo de verdade sem precisar
 * cadastrar tudo na mão. Só roda se o banco ainda estiver vazio.
 *
 * Login de demonstração:
 *   doador@reviva.com   / reviva123  (perfil ativo: DOADOR, já com itens publicados)
 *   receptor@reviva.com / reviva123  (perfil ativo: RECEPTOR)
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ItemRepository itemRepository;
    private final ComunidadeRepository comunidadeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return; // já tem dados (ex: reinício sem perder o H2), não duplica
        }

        Usuario doador = usuarioRepository.save(Usuario.builder()
                .nome("Marina Souza")
                .email("doador@reviva.com")
                .cpf("52998224725")
                .telefone("31987654321")
                .fotoUrl("https://i.pravatar.cc/256?img=47")
                .cep("30140071")
                .numero("120")
                .complemento("Apto 302")
                .latitude(-19.93556)
                .longitude(-43.93444)
                .raioBuscaKm(10)
                .emailVerificado(true)
                .telefoneVerificado(true)
                .reputacaoScore(4.8)
                .itensDoados(12)
                .kgResiduoEvitado(86.4)
                .pontos(245)
                .seloAtual(Usuario.SeloTier.OURO)
                .senhaHash(passwordEncoder.encode("reviva123"))
                .perfilAtivo(Usuario.PerfilAtivo.DOADOR)
                .build());

        Usuario receptor = usuarioRepository.save(Usuario.builder()
                .nome("Carlos Teixeira")
                .email("receptor@reviva.com")
                .cpf("39053344705")
                .telefone("31991234567")
                .fotoUrl("https://i.pravatar.cc/256?img=12")
                .cep("30130170")
                .numero("45")
                .complemento("Casa")
                .latitude(-19.93220)
                .longitude(-43.93870)
                .raioBuscaKm(8)
                .emailVerificado(true)
                .telefoneVerificado(true)
                .reputacaoScore(4.6)
                .itensDoados(4)
                .kgResiduoEvitado(22.8)
                .pontos(85)
                .seloAtual(Usuario.SeloTier.PRATA)
                .senhaHash(passwordEncoder.encode("reviva123"))
                .perfilAtivo(Usuario.PerfilAtivo.RECEPTOR)
                .build());

        itemRepository.save(Item.builder()
                .doador(doador).titulo("Jaqueta jeans P/M").descricao("Usada poucas vezes, sem manchas ou rasgos.")
                .categoria(Item.Categoria.ROUPAS).estadoConservacao(Item.EstadoConservacao.SEMINOVO)
                .tipoPublicacao(Item.TipoPublicacao.DOAR).impactoCo2Kg(3.4).pesoKg(3.4)
                .cep("30140071").numero("120").complemento("Apto 302")
                .bairro("Funcionários").cidade("Belo Horizonte").uf("MG").build());

        itemRepository.save(Item.builder()
                .doador(doador).titulo("Caixa de livros infantis").descricao("12 livros ilustrados, 3-8 anos.")
                .categoria(Item.Categoria.LIVROS).estadoConservacao(Item.EstadoConservacao.USADO)
                .tipoPublicacao(Item.TipoPublicacao.DOAR).impactoCo2Kg(2.1).pesoKg(2.1)
                .cep("30140071").numero("120").complemento("Apto 302")
                .bairro("Savassi").cidade("Belo Horizonte").uf("MG").build());

        itemRepository.save(Item.builder()
                .doador(doador).titulo("Estante de madeira").descricao("4 prateleiras, madeira maciça. Troco por item de cozinha ou eletrônico pequeno.")
                .categoria(Item.Categoria.MOVEIS).estadoConservacao(Item.EstadoConservacao.USADO)
                .tipoPublicacao(Item.TipoPublicacao.TROCAR).impactoCo2Kg(11.8).pesoKg(11.8)
                .cep("30140071").numero("120").complemento("Apto 302")
                .bairro("Funcionários").cidade("Belo Horizonte").uf("MG").build());

        itemRepository.save(Item.builder()
                .doador(doador).titulo("Carrinho de bebê").descricao("Modelo compacto, dobrável, rodas em bom estado.")
                .categoria(Item.Categoria.INFANTIL).estadoConservacao(Item.EstadoConservacao.SEMINOVO)
                .tipoPublicacao(Item.TipoPublicacao.DOAR).impactoCo2Kg(6.7).pesoKg(6.7)
                .cep("30140071").numero("120").complemento("Apto 302")
                .bairro("Santo Agostinho").cidade("Belo Horizonte").uf("MG").build());

        itemRepository.save(Item.builder()
                .doador(doador).titulo("Liquidificador 3 velocidades").descricao("Funcionando perfeitamente, motor testado.")
                .categoria(Item.Categoria.ELETRONICOS).estadoConservacao(Item.EstadoConservacao.USADO)
                .tipoPublicacao(Item.TipoPublicacao.TROCAR).impactoCo2Kg(4.2).pesoKg(4.2)
                .cep("30140071").numero("120").complemento("Apto 302")
                .bairro("Savassi").cidade("Belo Horizonte").uf("MG").build());

        itemRepository.save(Item.builder()
                .doador(doador).titulo("Jogo de panelas antiaderente").descricao("Conjunto com 5 peças, uso doméstico leve.")
                .categoria(Item.Categoria.COZINHA).estadoConservacao(Item.EstadoConservacao.USADO)
                .tipoPublicacao(Item.TipoPublicacao.DOAR).impactoCo2Kg(3.9).pesoKg(3.9)
                .cep("30140071").numero("120").complemento("Apto 302")
                .bairro("Funcionários").cidade("Belo Horizonte").uf("MG").build());

        comunidadeRepository.save(Comunidade.builder()
                .nome("BH Solidária").descricao("Rede de doação e troca entre vizinhos de Belo Horizonte.")
                .bairroReferencia("Região Centro-Sul").build());

        comunidadeRepository.save(Comunidade.builder()
                .nome("ONG Reviver").descricao("Mutirões de doação de agasalhos e móveis para famílias em vulnerabilidade.")
                .bairroReferencia("Funcionários").build());

        System.out.println("[DevDataSeeder] Banco populado com dados de demonstração.");
        System.out.println("[DevDataSeeder] Login doador:   doador@reviva.com   / reviva123");
        System.out.println("[DevDataSeeder] Login receptor: receptor@reviva.com / reviva123");
    }
}
