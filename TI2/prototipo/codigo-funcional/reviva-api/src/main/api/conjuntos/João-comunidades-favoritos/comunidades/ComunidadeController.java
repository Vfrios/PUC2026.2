package com.reviva.api.controller;

import com.reviva.api.dto.ComunidadeResponse;
import com.reviva.api.model.Comunidade;
import com.reviva.api.model.ComunidadePost;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ComunidadePostRepository;
import com.reviva.api.repository.ComunidadeRepository;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.service.NotificacaoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/** Cobre: Comunidades e Feed Social (grupos, participação, mural de publicações). */
@RestController
@RequestMapping("/api/comunidades")
@RequiredArgsConstructor
public class ComunidadeController {

    private final ComunidadeRepository comunidadeRepository;
    private final ComunidadePostRepository postRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public record ComunidadePayload(
            @NotBlank(message = "Informe o nome da comunidade.")
            @Size(max = 80, message = "Máximo de 80 caracteres")
            String nome,
            @Size(max = 500, message = "Máximo de 500 caracteres")
            String descricao,
            String categoria,
            String bairroReferencia,
            String cidade,
            String uf
    ) {}

    public record PostRequest(
            @NotBlank(message = "Escreva algo antes de enviar")
            @Size(max = 500, message = "Máximo de 500 caracteres")
            String texto
    ) {}

    /** Público; com token, informa se o usuário participa. Filtros opcionais por categoria, cidade/UF e texto. */
    @GetMapping
    public List<ComunidadeResponse> listar(@AuthenticationPrincipal Usuario usuario,
                                           @RequestParam(required = false) String categoria,
                                           @RequestParam(required = false) String cidade,
                                           @RequestParam(required = false) String uf,
                                           @RequestParam(required = false) String termo) {
        String usuarioId = usuario != null ? usuario.getId() : null;
        return comunidadeRepository.findAll().stream()
                .filter(c -> vazio(categoria) || categoria.equalsIgnoreCase(c.getCategoria()))
                .filter(c -> vazio(uf) || uf.equalsIgnoreCase(c.getUf()))
                .filter(c -> vazio(cidade) || contem(c.getCidade(), cidade) || contem(c.getBairroReferencia(), cidade))
                .filter(c -> vazio(termo) || contem(c.getNome(), termo) || contem(c.getDescricao(), termo)
                        || contem(c.getBairroReferencia(), termo))
                .map(c -> ComunidadeResponse.from(c, usuarioId, postRepository.countByComunidadeId(c.getId())))
                .sorted(Comparator.comparing(ComunidadeResponse::participando).reversed()
                        .thenComparing(ComunidadeResponse::totalMembros, Comparator.reverseOrder()))
                .toList();
    }

    @GetMapping("/{id}")
    public ComunidadeResponse obter(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        String usuarioId = usuario != null ? usuario.getId() : null;
        return ComunidadeResponse.from(c, usuarioId, postRepository.countByComunidadeId(c.getId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComunidadeResponse criar(@RequestBody @Valid ComunidadePayload payload,
                                    @AuthenticationPrincipal Usuario usuario) {
        if (vazio(payload.nome())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome da comunidade.");
        }
        Comunidade c = Comunidade.builder()
                .nome(payload.nome().trim())
                .descricao(payload.descricao() != null ? payload.descricao().trim() : "")
                .categoria(vazio(payload.categoria()) ? "GERAL" : payload.categoria().trim().toUpperCase())
                .bairroReferencia(payload.bairroReferencia() != null ? payload.bairroReferencia().trim() : "")
                .cidade(vazio(payload.cidade()) ? (usuario != null && usuario.getCidade() != null ? usuario.getCidade() : "Belo Horizonte") : payload.cidade().trim())
                .uf(vazio(payload.uf()) ? (usuario != null && usuario.getUf() != null ? usuario.getUf() : "MG") : payload.uf().trim())
                .criadorId(usuario != null ? usuario.getId() : null)
                .criadaEm(Instant.now())
                .build();
        c.normalizarMembros();
        if (usuario != null) {
            c.getMembrosIds().add(usuario.getId());
        }
        Comunidade salva = comunidadeRepository.save(c);
        return responder(salva, usuario);
    }

    @PutMapping("/{id}")
    public ComunidadeResponse editar(@PathVariable String id,
                                     @RequestBody @Valid ComunidadePayload payload,
                                     @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        validarCriador(c, usuario, "editar");
        if (vazio(payload.nome())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome da comunidade.");
        }
        c.setNome(payload.nome().trim());
        if (payload.descricao() != null) {
            c.setDescricao(payload.descricao().trim());
        }
        if (!vazio(payload.categoria())) {
            c.setCategoria(payload.categoria().trim().toUpperCase());
        }
        if (payload.bairroReferencia() != null) {
            c.setBairroReferencia(payload.bairroReferencia().trim());
        }
        if (!vazio(payload.cidade())) {
            c.setCidade(payload.cidade().trim());
        }
        if (!vazio(payload.uf())) {
            c.setUf(payload.uf().trim());
        }
        return responder(comunidadeRepository.save(c), usuario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        validarCriador(c, usuario, "excluir");
        postRepository.deleteByComunidadeId(id);
        comunidadeRepository.deleteById(id);
    }

    @PostMapping(value = {"/{id}/participar", "/{id}/membros"})
    public ComunidadeResponse participar(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        c.normalizarMembros();
        c.getMembrosIds().add(usuario.getId());
        return responder(comunidadeRepository.save(c), usuario);
    }

    @PostMapping("/{id}/sair")
    public ComunidadeResponse sairPost(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        return sairComunidade(id, usuario);
    }

    @DeleteMapping(value = {"/{id}/sair", "/{id}/membros"})
    public ComunidadeResponse sairDelete(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        return sairComunidade(id, usuario);
    }

    private ComunidadeResponse sairComunidade(String id, Usuario usuario) {
        Comunidade c = buscar(id);
        c.normalizarMembros();
        c.getMembrosIds().remove(usuario.getId());
        return responder(comunidadeRepository.save(c), usuario);
    }

    /** Mural/mensagens: histórico em ordem cronológica ascendente. */
    @GetMapping(value = {"/{id}/posts", "/{id}/mensagens"})
    public List<ComunidadeResponse.Post> posts(@PathVariable String id,
                                               @RequestParam(defaultValue = "50") int limit,
                                               @AuthenticationPrincipal Usuario usuario) {
        buscar(id);
        String usuarioId = usuario != null ? usuario.getId() : null;
        int limiteSeguro = Math.max(1, Math.min(limit, 100));
        List<ComunidadePost> posts = postRepository
                .findByComunidadeIdOrderByCriadoEmDesc(id, PageRequest.of(0, limiteSeguro));
        return posts.stream()
                .sorted(Comparator.comparing(ComunidadePost::getCriadoEm))
                .map(p -> ComunidadeResponse.Post.from(p, usuarioId))
                .toList();
    }

    @PostMapping(value = {"/{id}/posts", "/{id}/mensagens"})
    @ResponseStatus(HttpStatus.CREATED)
    public ComunidadeResponse.Post publicar(@PathVariable String id,
                                            @RequestBody @Valid PostRequest req,
                                            @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        if (!c.idsDosMembros().contains(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Participe da comunidade para publicar.");
        }
        ComunidadePost post = postRepository.save(ComunidadePost.builder()
                .comunidadeId(id)
                .autorId(usuario.getId())
                .autorNome(usuario.getNome())
                .autorFotoUrl(usuario.getFotoUrl())
                .texto(req.texto().trim())
                .criadoEm(Instant.now())
                .build());
        String titulo = usuario.getNome() + " publicou em " + c.getNome();
        usuarioRepository.findAllById(c.idsDosMembros()).stream()
                .filter(m -> !m.getId().equals(usuario.getId()))
                .forEach(m -> notificacaoService.notificar(m, titulo, Notificacao.Tipo.COMUNIDADE));
        return ComunidadeResponse.Post.from(post, usuario.getId());
    }

    /** Alterna o "apoio" (curtida) do usuário em uma publicação. */
    @PostMapping(value = {"/{id}/posts/{postId}/apoiar", "/{id}/mensagens/{postId}/apoiar"})
    public ComunidadeResponse.Post apoiar(@PathVariable String id, @PathVariable String postId,
                                          @AuthenticationPrincipal Usuario usuario) {
        ComunidadePost post = postRepository.findById(postId)
                .filter(p -> id.equals(p.getComunidadeId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada"));
        if (!post.getApoios().remove(usuario.getId())) {
            post.getApoios().add(usuario.getId());
        }
        return ComunidadeResponse.Post.from(postRepository.save(post), usuario.getId());
    }

    private ComunidadeResponse responder(Comunidade c, Usuario usuario) {
        String usuarioId = usuario != null ? usuario.getId() : null;
        return ComunidadeResponse.from(c, usuarioId, postRepository.countByComunidadeId(c.getId()));
    }

    private Comunidade buscar(String id) {
        return comunidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));
    }

    private static void validarCriador(Comunidade comunidade, Usuario usuario, String acao) {
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
        }
        if (comunidade.getCriadorId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Esta comunidade não tem criador definido e não pode ser alterada");
        }
        if (!comunidade.getCriadorId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Apenas o criador pode " + acao + " a comunidade.");
        }
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static boolean contem(String valor, String busca) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(busca.trim().toLowerCase(Locale.ROOT));
    }
}
