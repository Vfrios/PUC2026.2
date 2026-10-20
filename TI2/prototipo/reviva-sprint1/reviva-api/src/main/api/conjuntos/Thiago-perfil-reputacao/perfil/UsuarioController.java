package com.reviva.api.controller;

import com.reviva.api.dto.AvaliacaoResponse;
import com.reviva.api.dto.ItemResponse;
import com.reviva.api.dto.PerfilPublicoResponse;
import com.reviva.api.dto.PerfilRequest;
import com.reviva.api.dto.UsuarioResponse;
import com.reviva.api.model.Item;
import com.reviva.api.model.Avaliacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import com.reviva.api.service.AvaliacaoService;
import com.reviva.api.service.BloqueioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Cobre perfil e reputação inicial, incluindo avaliações históricas.
 * Não há mais restrição de rota por perfil (Doador/Receptor): qualquer
 * usuário autenticado doa e recebe com a mesma conta.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final ItemRepository itemRepository;
    private final AvaliacaoService avaliacaoService;
    private final BloqueioService bloqueioService;

    public record ReputacaoDetalhe(AvaliacaoService.Resumo resumo, List<AvaliacaoResponse> avaliacoes) {}

    @GetMapping("/{id}/itens")
    public List<ItemResponse> itensPublicos(@PathVariable String id, @AuthenticationPrincipal Usuario visitante) {
        buscarUsuario(id);
        if (visitante != null && bloqueioService.existeBloqueio(visitante.getId(), id)) return List.of();
        return ItemResponse.from(itemRepository.findPublicadosByDoadorId(id));
    }

    @GetMapping("/me")
    public UsuarioResponse perfil(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.from(usuario);
    }

    /** Edição dos dados pessoais, foto e endereço principal. */
    @PutMapping("/me")
    public UsuarioResponse atualizar(@AuthenticationPrincipal Usuario usuario, @RequestBody @Valid PerfilRequest req) {
        String telefone = somenteDigitos(req.telefone());
        if (!telefone.isEmpty() && telefone.length() != 10 && telefone.length() != 11) {
            throw new IllegalArgumentException("Celular inválido. Use DDD + número.");
        }
        String cep = somenteDigitos(req.cep());
        if (!cep.isEmpty() && cep.length() != 8) {
            throw new IllegalArgumentException("CEP inválido.");
        }
        if (req.fotoUrl() != null && !req.fotoUrl().isBlank()
                && !req.fotoUrl().startsWith("data:image/") && !req.fotoUrl().startsWith("https://")) {
            throw new IllegalArgumentException("Formato de foto não suportado.");
        }
        usuario.setNome(req.nome().trim());
        if (req.telefone() != null) usuario.setTelefone(telefone);
        if (req.fotoUrl() != null) usuario.setFotoUrl(req.fotoUrl().isBlank() ? null : req.fotoUrl());
        if (req.cep() != null) usuario.setCep(cep);
        if (req.logradouro() != null) usuario.setLogradouro(req.logradouro().trim());
        if (req.bairro() != null) usuario.setBairro(req.bairro().trim());
        if (req.cidade() != null) usuario.setCidade(req.cidade().trim());
        if (req.uf() != null) usuario.setUf(req.uf().trim().toUpperCase());
        if (req.numero() != null) usuario.setNumero(req.numero().trim());
        if (req.complemento() != null) usuario.setComplemento(req.complemento().trim());
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    /** Dashboard de Impacto: kg evitados, itens doados e selo atual já vêm no próprio Usuario. */
    @GetMapping("/{id}/reputacao")
    public UsuarioResponse reputacao(@PathVariable String id) {
        return UsuarioResponse.from(buscarUsuario(id));
    }

    /** Perfil público completo do anunciante (sem dados pessoais). */
    @GetMapping("/{id}/publico")
    public PerfilPublicoResponse publico(@PathVariable String id) {
        Usuario u = buscarUsuario(id);
        return PerfilPublicoResponse.from(u, avaliacaoService.recebidas(id).size());
    }

    /** Histórico de avaliações recebidas + médias por categoria. */
    @GetMapping("/{id}/avaliacoes")
    public ReputacaoDetalhe avaliacoes(@PathVariable String id) {
        buscarUsuario(id);
        List<Avaliacao> recebidas = avaliacaoService.recebidas(id);
        return new ReputacaoDetalhe(avaliacaoService.resumo(recebidas), AvaliacaoResponse.from(recebidas));
    }

    private Usuario buscarUsuario(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private static String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }
}
