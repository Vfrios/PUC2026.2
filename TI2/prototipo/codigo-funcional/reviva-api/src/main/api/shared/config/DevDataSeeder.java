package com.reviva.api.config;

import com.reviva.api.model.Comunidade;
import com.reviva.api.model.ComunidadePost;
import com.reviva.api.model.Item;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ComunidadePostRepository;
import com.reviva.api.repository.ComunidadeRepository;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.bson.Document;
import org.bson.types.ObjectId;
import com.mongodb.DBRef;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Popula o banco MongoDB com dados de demonstração ao subir a aplicação em modo
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
    private final ComunidadePostRepository postRepository;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
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

            System.out.println("[DevDataSeeder] Banco populado com dados de demonstração.");
            System.out.println("[DevDataSeeder] Login doador:   doador@reviva.com   / reviva123");
            System.out.println("[DevDataSeeder] Login receptor: receptor@reviva.com / reviva123");
        }

        // Usuários precisam existir antes das comunidades para que criador e autores sejam referências válidas.
        if (comunidadeRepository.count() == 0) {
            semearComunidades();
        } else {
            completarComunidadesAntigas();
        }
    }

    /** Semeia comunidades iniciais e histórico de mensagens quando o banco de comunidades estiver vazio. */
    public void semearComunidades() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        Usuario autor1 = usuarios.stream().filter(u -> "doador@reviva.com".equalsIgnoreCase(u.getEmail())).findFirst()
                .orElse(usuarios.isEmpty() ? null : usuarios.get(0));
        Usuario autor2 = usuarios.stream().filter(u -> "receptor@reviva.com".equalsIgnoreCase(u.getEmail())).findFirst()
                .orElse(usuarios.size() > 1 ? usuarios.get(1) : autor1);

        if (autor1 == null || autor2 == null) {
            throw new IllegalStateException("Não é possível semear comunidades sem usuários válidos.");
        }
        String criadorId = autor1.getId();

        Comunidade bh = Comunidade.builder()
                .nome("BH Solidária")
                .descricao("Rede de doação e troca entre vizinhos de Belo Horizonte.")
                .bairroReferencia("Região Centro-Sul")
                .categoria("GERAL")
                .cidade("Belo Horizonte")
                .uf("MG")
                .criadorId(criadorId)
                .criadaEm(Instant.now().minus(7, ChronoUnit.DAYS))
                .build();
        bh.normalizarMembros();
        bh.getMembrosIds().add(autor1.getId());
        bh.getMembrosIds().add(autor2.getId());
        bh = comunidadeRepository.save(bh);

        Comunidade ong = Comunidade.builder()
                .nome("ONG Reviver")
                .descricao("Mutirões de doação de agasalhos e móveis para famílias em vulnerabilidade.")
                .bairroReferencia("Funcionários")
                .categoria("ROUPAS")
                .cidade("Belo Horizonte")
                .uf("MG")
                .criadorId(criadorId)
                .criadaEm(Instant.now().minus(5, ChronoUnit.DAYS))
                .build();
        ong.normalizarMembros();
        ong.getMembrosIds().add(autor1.getId());
        ong = comunidadeRepository.save(ong);

        Comunidade pamp = Comunidade.builder()
                .nome("Leitores da Pampulha")
                .descricao("Troca de livros didáticos, romances e HQs entre vizinhos.")
                .bairroReferencia("Pampulha")
                .categoria("LIVROS")
                .cidade("Belo Horizonte")
                .uf("MG")
                .criadorId(criadorId)
                .criadaEm(Instant.now().minus(3, ChronoUnit.DAYS))
                .build();
        pamp.normalizarMembros();
        pamp.getMembrosIds().add(autor1.getId());
        pamp = comunidadeRepository.save(pamp);

        // Popula histórico de mensagens nas comunidades
        Instant agora = Instant.now();
        if (postRepository.countByComunidadeId(bh.getId()) == 0) {
            postRepository.save(ComunidadePost.builder()
                    .comunidadeId(bh.getId())
                    .autorId(autor1.getId())
                    .autorNome(autor1.getNome())
                    .autorFotoUrl(autor1.getFotoUrl())
                    .texto("Olá a todos! Sejam muito bem-vindos à comunidade BH Solidária.")
                    .criadoEm(agora.minus(48, ChronoUnit.HOURS))
                    .build());

            postRepository.save(ComunidadePost.builder()
                    .comunidadeId(bh.getId())
                    .autorId(autor2.getId())
                    .autorNome(autor2.getNome())
                    .autorFotoUrl(autor2.getFotoUrl())
                    .texto("Muito bom encontrar essa iniciativa aqui no bairro! Tenho livros infantis para doar.")
                    .criadoEm(agora.minus(24, ChronoUnit.HOURS))
                    .build());

            postRepository.save(ComunidadePost.builder()
                    .comunidadeId(bh.getId())
                    .autorId(autor1.getId())
                    .autorNome(autor1.getNome())
                    .autorFotoUrl(autor1.getFotoUrl())
                    .texto("Perfeito, Carlos! Pode publicar lá nos anúncios ou combinar aqui pelo grupo.")
                    .criadoEm(agora.minus(2, ChronoUnit.HOURS))
                    .build());
        }

        if (postRepository.countByComunidadeId(ong.getId()) == 0) {
            postRepository.save(ComunidadePost.builder()
                    .comunidadeId(ong.getId())
                    .autorId(autor1.getId())
                    .autorNome(autor1.getNome())
                    .autorFotoUrl(autor1.getFotoUrl())
                    .texto("Estamos arrecadando agasalhos e cobertores para a campanha de inverno!")
                    .criadoEm(agora.minus(12, ChronoUnit.HOURS))
                    .build());
        }

        System.out.println("[DevDataSeeder] Comunidades e histórico de mensagens semeados.");
    }

    /** Bancos criados antes dos filtros de comunidade não têm categoria/cidade: preenche com padrões. */
    private void completarComunidadesAntigas() {
        // Só precisamos do _id; a projeção evita desserializar campos legados do usuário.
        Document usuarioBruto = mongoTemplate.getCollection("usuarios")
                .find().projection(new Document("_id", 1)).first();
        String responsavelId = idComoString(usuarioBruto != null ? usuarioBruto.get("_id") : null);
        for (Document comunidade : mongoTemplate.getCollection("comunidades").find()) {
            Document campos = new Document();
            if (comunidade.get("categoria") == null) {
                campos.put("categoria", "ONG Reviver".equals(comunidade.getString("nome")) ? "ROUPAS" : "GERAL");
            }
            if (comunidade.get("cidade") == null) campos.put("cidade", "Belo Horizonte");
            if (comunidade.get("uf") == null) campos.put("uf", "MG");
            if (comunidade.get("criadorId") == null && responsavelId != null) {
                campos.put("criadorId", responsavelId);
            }

            Set<String> membrosIds = new LinkedHashSet<>();
            coletarIds(comunidade.get("membrosIds"), membrosIds);
            coletarIds(comunidade.get("membros"), membrosIds);
            if (membrosIds.isEmpty() && responsavelId != null) membrosIds.add(responsavelId);
            campos.put("membrosIds", membrosIds);

            Document atualizacao = new Document("$set", campos);
            if (comunidade.containsKey("membros")) {
                // O formato DBRef antigo é consolidado em membrosIds e então descartado.
                atualizacao.put("$unset", new Document("membros", ""));
            }
            mongoTemplate.getCollection("comunidades")
                    .updateOne(new Document("_id", comunidade.get("_id")), atualizacao);
        }

        // Posts antigos podem referenciar a comunidade como ObjectId; o repositório atual usa String.
        for (Document post : mongoTemplate.getCollection("comunidade_posts")
                .find(new Document("comunidadeId", new Document("$type", "objectId")))) {
            mongoTemplate.getCollection("comunidade_posts").updateOne(
                    new Document("_id", post.get("_id")),
                    new Document("$set", new Document("comunidadeId", idComoString(post.get("comunidadeId")))));
        }
    }

    private static void coletarIds(Object valor, Set<String> destino) {
        if (!(valor instanceof Iterable<?> valores)) return;
        for (Object item : valores) {
            Object id = item;
            if (item instanceof DBRef ref) id = ref.getId();
            else if (item instanceof Document doc) id = doc.getOrDefault("$id", doc.get("_id"));
            String convertido = idComoString(id);
            if (convertido != null) destino.add(convertido);
        }
    }

    private static String idComoString(Object id) {
        if (id instanceof ObjectId objectId) return objectId.toHexString();
        return id != null ? id.toString() : null;
    }
}
