package com.reviva.api.controller;

import com.reviva.api.config.CarregadorEmLote;
import com.reviva.api.config.DbRefCache;
import org.bson.Document;
import org.bson.types.ObjectId;
import com.reviva.api.dto.MensagemRequest;
import com.reviva.api.dto.MensagemResponse;
import com.reviva.api.dto.SolicitacaoResponse;
import com.reviva.api.model.Mensagem;
import com.reviva.api.model.Notificacao;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.MensagemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.reviva.api.service.NotificacaoService;
import com.reviva.api.service.BloqueioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * Cobre a tela de chat por meio de REST e atualizações periódicas no frontend.
 */
@RestController
@RequestMapping("/api/solicitacoes/{solicitacaoId}/mensagens")
@RequiredArgsConstructor
@Slf4j
public class MensagemController {

    private final MensagemRepository mensagemRepository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final NotificacaoService notificacaoService;
    private final BloqueioService bloqueioService;
    private final MongoTemplate mongoTemplate;
    private final CarregadorEmLote carregadorEmLote;

    @GetMapping
    public List<MensagemResponse> listar(@PathVariable String solicitacaoId, @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        List<Mensagem> mensagens = mensagensDa(solicitacao);
        // Abrir o chat = mensagem entregue + lida (checks azuis no WhatsApp).
        marcarRecebidas(mensagens, usuario, true);
        // Notificações CHAT dessa conversa saem da tela de Notificações.
        notificacaoService.marcarChatComoLido(usuario, solicitacao);
        return MensagemResponse.from(mensagens);
    }

    /**
     * Confirma entrega/leitura das mensagens recebidas quando o chat é consultado.
     */
    @PostMapping("/lidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarLidas(@PathVariable String solicitacaoId, @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        marcarRecebidas(mensagensDa(solicitacao), usuario, true);
        notificacaoService.marcarChatComoLido(usuario, solicitacao);
    }

    private List<Mensagem> mensagensDa(Solicitacao solicitacao) {
        List<Object> ids = new ArrayList<>(List.of(solicitacao.getId()));
        if (ObjectId.isValid(solicitacao.getId())) ids.add(new ObjectId(solicitacao.getId()));
        Document filtro = new Document("solicitacao.$id", new Document("$in", ids));
        return carregadorEmLote.buscar(filtro, new Document("criadaEm", 1), 0, Mensagem.class)
                .stream().filter(mensagem -> mensagem.getRemetente() != null).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemResponse enviar(@PathVariable String solicitacaoId, @RequestBody @Valid MensagemRequest req,
                                   @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = buscarEValidarAcesso(solicitacaoId, usuario);
        if (solicitacao.getStatus() == Solicitacao.StatusSolicitacao.CANCELADA
                || solicitacao.getStatus() == Solicitacao.StatusSolicitacao.RECUSADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta conversa foi encerrada e não aceita novas mensagens.");
        }
        Usuario destinatario = destinatarioDa(solicitacao, usuario);
                if (destinatario != null && bloqueioService.existeBloqueio(usuario.getId(), destinatario.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta interação não está disponível.");
                }
        Mensagem mensagem = Mensagem.builder()
                .solicitacao(solicitacao)
                .remetente(usuario)
                .texto(req.texto())
                .entregue(false)
                .lida(false)
                .build();
        Mensagem salva = mensagemRepository.save(mensagem);

        // Só o preview — evita regravar o documento inteiro (e os DBRefs) no Atlas.
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(solicitacao.getId())),
                new Update()
                        .set("mensagem", SolicitacaoResponse.previewTexto(req.texto())),
                Solicitacao.class);
        DbRefCache.limpar();

        MensagemResponse resposta = MensagemResponse.from(salva);
        if (destinatario != null) {
            String tituloItem = solicitacao.getItem() != null && solicitacao.getItem().getTitulo() != null
                    ? solicitacao.getItem().getTitulo()
                    : "item";
            String nome = usuario.getNome() != null ? usuario.getNome() : "Alguém";
            String titulo = nome + " enviou uma mensagem sobre \"" + tituloItem + "\"";
            try {
                notificacaoService.notificar(destinatario, titulo, Notificacao.Tipo.CHAT, solicitacao);
            } catch (RuntimeException error) {
                log.warn("Mensagem {} foi salva, mas a notificação para o destinatário falhou.", salva.getId(), error);
            }
        }

        return resposta;
    }

    /** Só o doador do item ou o receptor da solicitação podem ver/enviar mensagens dela. */
    private Solicitacao buscarEValidarAcesso(String solicitacaoId, Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findValidById(solicitacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        if (solicitacao.getReceptor() == null) {
            throw new IllegalArgumentException("Esta conversa possui dados inválidos e não está disponível");
        }
        boolean ehReceptor = solicitacao.getReceptor().getId().equals(usuario.getId());
        // doadorId denormalizado evita depender do DBRef item.doador no caminho quente.
        boolean ehDoador = usuario.getId().equals(solicitacao.getDoadorId())
                || (solicitacao.getItem() != null && solicitacao.getItem().getDoador() != null
                && usuario.getId().equals(solicitacao.getItem().getDoador().getId()));
        if (!ehDoador && !ehReceptor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta conversa");
        }
        return solicitacao;
    }

    private Usuario destinatarioDa(Solicitacao solicitacao, Usuario remetente) {
        boolean ehReceptor = solicitacao.getReceptor().getId().equals(remetente.getId());
        if (ehReceptor) {
            return solicitacao.getItem() != null ? solicitacao.getItem().getDoador() : null;
        }
        return solicitacao.getReceptor();
    }

    private void marcarRecebidas(List<Mensagem> mensagens, Usuario usuario, boolean comoLida) {
        List<Mensagem> atualizadas = new ArrayList<>();
        for (Mensagem mensagem : mensagens) {
            if (mensagem.getRemetente().getId().equals(usuario.getId())) continue;
            boolean mudou = false;
            if (!Boolean.TRUE.equals(mensagem.getEntregue())) {
                mensagem.setEntregue(true);
                mudou = true;
            }
            if (comoLida && !Boolean.TRUE.equals(mensagem.getLida())) {
                mensagem.setLida(true);
                mudou = true;
            }
            if (mudou) atualizadas.add(mensagem);
        }
        if (atualizadas.isEmpty()) return;
        // Uma única escrita em lote: saveAll faria uma ida ao banco por mensagem.
        Update update = new Update().set("entregue", true);
        if (comoLida) update.set("lida", true);
        mongoTemplate.updateMulti(Query.query(Criteria.where("_id").in(atualizadas.stream().map(Mensagem::getId).toList())),
                update, Mensagem.class);
        DbRefCache.limpar();
    }
}
