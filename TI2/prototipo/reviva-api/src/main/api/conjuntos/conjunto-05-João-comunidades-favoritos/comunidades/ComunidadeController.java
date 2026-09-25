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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    public record PostRequest(@NotBlank(message = "Escreva algo antes de publicar")
                              @Size(max = 500, message = "Máximo de 500 caracteres") String texto) {}

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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComunidadeResponse criar(@RequestBody Comunidade comunidade, @AuthenticationPrincipal Usuario usuario) {
        if (vazio(comunidade.getNome())) throw new IllegalArgumentException("Informe o nome da comunidade.");
        comunidade.setId(null);
        comunidade.getMembrosIds().add(usuario.getId());
        return ComunidadeResponse.from(comunidadeRepository.save(comunidade), usuario.getId(), 0);
    }

    @PostMapping("/{id}/participar")
    public ComunidadeResponse participar(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        c.normalizarMembros();
        c.getMembrosIds().add(usuario.getId());
        return responder(comunidadeRepository.save(c), usuario);
    }

    @PostMapping("/{id}/sair")
    public ComunidadeResponse sair(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Comunidade c = buscar(id);
        c.normalizarMembros();
        c.getMembrosIds().remove(usuario.getId());
        return responder(comunidadeRepository.save(c), usuario);
    }

    /** Mural: visível para quem está autenticado; publicar exige participar. */
    @GetMapping("/{id}/posts")
    public List<ComunidadeResponse.Post> posts(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        buscar(id);
        return postRepository.findTop50ByComunidadeIdOrderByCriadoEmDesc(id).stream()
                .map(p -> ComunidadeResponse.Post.from(p, usuario.getId()))
                .toList();
    }

    @PostMapping("/{id}/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ComunidadeResponse.Post publicar(@PathVariable String id, @RequestBody @Valid PostRequest req,
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
                .build());
        String titulo = usuario.getNome() + " publicou em " + c.getNome();
        usuarioRepository.findAllById(c.idsDosMembros()).stream()
                .filter(m -> !m.getId().equals(usuario.getId()))
                .forEach(m -> notificacaoService.notificar(m, titulo, Notificacao.Tipo.COMUNIDADE));
        return ComunidadeResponse.Post.from(post, usuario.getId());
    }

    /** Alterna o "apoio" (curtida) do usuário em uma publicação. */
    @PostMapping("/{id}/posts/{postId}/apoiar")
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
        return ComunidadeResponse.from(c, usuario.getId(), postRepository.countByComunidadeId(c.getId()));
    }

    private Comunidade buscar(String id) {
        return comunidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada"));
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static boolean contem(String valor, String busca) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(busca.trim().toLowerCase(Locale.ROOT));
    }
}
