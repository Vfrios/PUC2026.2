package com.reviva.api.controller;

import com.reviva.api.dto.UsuarioResponse;
import com.reviva.api.dto.ItemResponse;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Cobre: Perfil / Configurações, Dashboard de Impacto, Reputação / Badges.
 * Não há mais restrição de rota por perfil (Doador/Receptor): qualquer
 * usuário autenticado doa e recebe com a mesma conta.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final ItemRepository itemRepository;

    @GetMapping("/{id}/itens")
    public java.util.List<ItemResponse> itensPublicos(@PathVariable String id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        return ItemResponse.from(itemRepository.findPublicadosByDoadorId(id));
    }

    @GetMapping("/me")
    public UsuarioResponse perfil(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.from(usuario);
    }

    /** Mantido por compatibilidade com o front atual; não restringe mais nenhuma rota. */
    @PatchMapping("/me/perfil-ativo")
    public UsuarioResponse trocarPerfilAtivo(@AuthenticationPrincipal Usuario usuario,
                                              @RequestParam Usuario.PerfilAtivo perfil) {
        usuario.setPerfilAtivo(perfil);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @PatchMapping("/me/localizacao")
    public UsuarioResponse atualizarLocalizacao(@AuthenticationPrincipal Usuario usuario,
                                                 @RequestParam Double latitude,
                                                 @RequestParam Double longitude,
                                                 @RequestParam(required = false) Integer raioBuscaKm) {
        usuario.setLatitude(latitude);
        usuario.setLongitude(longitude);
        if (raioBuscaKm != null) usuario.setRaioBuscaKm(raioBuscaKm);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    /** Dashboard de Impacto: kg evitados, itens doados e selo atual já vêm no próprio Usuario. */
    @GetMapping("/{id}/reputacao")
    public UsuarioResponse reputacao(@PathVariable String id) {
        return UsuarioResponse.from(usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado")));
    }
}
