package com.reviva.api.service;

import com.reviva.api.model.Bloqueio;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.BloqueioRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BloqueioService {

    private final BloqueioRepository bloqueioRepository;
    private final UsuarioRepository usuarioRepository;

    public record UsuarioBloqueado(String id, String nome, String fotoUrl, Instant bloqueadoEm) {}

    public Bloqueio bloquear(Usuario bloqueador, String bloqueadoId) {
        if (bloqueador.getId().equals(bloqueadoId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível bloquear a própria conta.");
        }
        usuarioRepository.findById(bloqueadoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        return bloqueioRepository.findByBloqueadorIdAndBloqueadoId(bloqueador.getId(), bloqueadoId)
                .orElseGet(() -> bloqueioRepository.save(Bloqueio.builder()
                        .bloqueadorId(bloqueador.getId())
                        .bloqueadoId(bloqueadoId)
                        .build()));
    }

    public void desbloquear(Usuario bloqueador, String bloqueadoId) {
        bloqueioRepository.deleteByBloqueadorIdAndBloqueadoId(bloqueador.getId(), bloqueadoId);
    }

    public List<UsuarioBloqueado> listar(Usuario bloqueador) {
        return bloqueioRepository.findByBloqueadorIdOrderByCriadoEmDesc(bloqueador.getId()).stream()
                .map(bloqueio -> usuarioRepository.findById(bloqueio.getBloqueadoId())
                        .map(usuario -> new UsuarioBloqueado(usuario.getId(), usuario.getNome(), usuario.getFotoUrl(), bloqueio.getCriadoEm()))
                        .orElse(null))
                .filter(usuario -> usuario != null)
                .toList();
    }

    public Set<String> usuariosOcultosPara(Usuario usuario) {
        Set<String> ids = new HashSet<>();
        bloqueioRepository.findByBloqueadorIdOrderByCriadoEmDesc(usuario.getId())
                .forEach(bloqueio -> ids.add(bloqueio.getBloqueadoId()));
        bloqueioRepository.findByBloqueadoId(usuario.getId())
                .forEach(bloqueio -> ids.add(bloqueio.getBloqueadorId()));
        return ids;
    }

    public boolean existeBloqueio(String usuarioId, String outroUsuarioId) {
        return bloqueioRepository.existsByBloqueadorIdAndBloqueadoId(usuarioId, outroUsuarioId)
                || bloqueioRepository.existsByBloqueadorIdAndBloqueadoId(outroUsuarioId, usuarioId);
    }
}