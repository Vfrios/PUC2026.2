package com.reviva.api.service;

import com.reviva.api.dto.EnderecoRequest;
import com.reviva.api.model.Endereco;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.EnderecoRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    static final int LIMITE_ENDERECOS = 10;

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Endereco> listar(Usuario usuario) {
        return enderecoRepository.findByUsuarioIdOrderByPrincipalDescCriadoEmAsc(usuario.getId());
    }

    public Endereco criar(Usuario usuario, EnderecoRequest req) {
        List<Endereco> existentes = listar(usuario);
        if (existentes.size() >= LIMITE_ENDERECOS) {
            throw new IllegalArgumentException("Você pode salvar até " + LIMITE_ENDERECOS + " endereços.");
        }
        validarApelido(existentes, req.apelido(), null);
        Endereco e = Endereco.builder().usuarioId(usuario.getId()).build();
        aplicar(e, req);
        boolean principal = existentes.isEmpty() || Boolean.TRUE.equals(req.principal());
        e.setPrincipal(false);
        e = enderecoRepository.save(e);
        return principal ? definirPrincipal(usuario, e) : e;
    }

    public Endereco atualizar(Usuario usuario, String id, EnderecoRequest req) {
        Endereco e = buscarDoUsuario(usuario, id);
        validarApelido(listar(usuario), req.apelido(), id);
        aplicar(e, req);
        e = enderecoRepository.save(e);
        if (Boolean.TRUE.equals(req.principal()) || e.isPrincipal()) {
            return definirPrincipal(usuario, e);
        }
        return e;
    }

    public void remover(Usuario usuario, String id) {
        Endereco e = buscarDoUsuario(usuario, id);
        enderecoRepository.delete(e);
        if (e.isPrincipal()) {
            listar(usuario).stream().findFirst().ifPresent(outro -> definirPrincipal(usuario, outro));
        }
    }

    /** Marca como padrão e copia para o cadastro do usuário (usado no agendamento e no anúncio). */
    public Endereco definirPrincipal(Usuario usuario, String id) {
        return definirPrincipal(usuario, buscarDoUsuario(usuario, id));
    }

    private Endereco definirPrincipal(Usuario usuario, Endereco escolhido) {
        List<Endereco> todos = listar(usuario);
        for (Endereco e : todos) {
            e.setPrincipal(e.getId().equals(escolhido.getId()));
        }
        enderecoRepository.saveAll(todos);
        escolhido.setPrincipal(true);

        usuario.setCep(escolhido.getCep());
        usuario.setLogradouro(escolhido.getLogradouro());
        usuario.setNumero(escolhido.getNumero());
        usuario.setComplemento(escolhido.getComplemento());
        usuario.setBairro(escolhido.getBairro());
        usuario.setCidade(escolhido.getCidade());
        usuario.setUf(escolhido.getUf());
        if (escolhido.getLatitude() != null && escolhido.getLongitude() != null) {
            usuario.setLatitude(escolhido.getLatitude());
            usuario.setLongitude(escolhido.getLongitude());
        }
        usuarioRepository.save(usuario);
        return escolhido;
    }

    private Endereco buscarDoUsuario(Usuario usuario, String id) {
        Endereco e = enderecoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado"));
        if (!usuario.getId().equals(e.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este endereço não é seu.");
        }
        return e;
    }

    private static void validarApelido(List<Endereco> existentes, String apelido, String ignorarId) {
        boolean repetido = existentes.stream()
                .anyMatch(e -> !e.getId().equals(ignorarId) && e.getApelido() != null
                        && e.getApelido().trim().equalsIgnoreCase(apelido.trim()));
        if (repetido) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um endereço com o apelido \"" + apelido.trim() + "\".");
        }
    }

    private static void aplicar(Endereco e, EnderecoRequest req) {
        e.setApelido(req.apelido().trim());
        e.setCep(req.cep().replaceAll("\\D", ""));
        e.setLogradouro(req.logradouro().trim());
        e.setNumero(req.numero() != null ? req.numero().trim() : null);
        e.setComplemento(req.complemento() != null ? req.complemento().trim() : null);
        e.setBairro(req.bairro().trim());
        e.setCidade(req.cidade().trim());
        e.setUf(req.uf().trim().toUpperCase());
        e.setLatitude(req.latitude());
        e.setLongitude(req.longitude());
    }
}
