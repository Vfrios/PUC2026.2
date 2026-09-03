package com.reviva.api.controller;

import com.reviva.api.dto.AgendamentoRequest;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.reviva.api.service.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/** Cobre: Agendamento (Doador/Receptor), Confirmação de Doação e Confirmação de Recebimento. */
@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;
    private final AgendamentoRepository agendamentoRepository;
    private final SolicitacaoRepository solicitacaoRepository;

        @GetMapping("/solicitacao/{solicitacaoId}")
        public Optional<Agendamento> buscarPorSolicitacao(@PathVariable String solicitacaoId,
                             @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findValidById(solicitacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        validarParticipante(solicitacao, usuario);
        return agendamentoRepository.findBySolicitacaoId(solicitacaoId)
            .map(agendamentoService::garantirCodigo);
        }

        @PostMapping("/solicitacao/{solicitacaoId}/cancelar")
        public Agendamento cancelar(@PathVariable String solicitacaoId,
                    @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findValidById(solicitacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        validarParticipante(solicitacao, usuario);
        return agendamentoRepository.findBySolicitacaoId(solicitacaoId)
            .map(agendamentoService::cancelar)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));
        }

    @PostMapping
    public Agendamento agendar(@RequestBody @Valid AgendamentoRequest req,
                               @AuthenticationPrincipal Usuario usuario) {
        Solicitacao solicitacao = solicitacaoRepository.findValidById(req.solicitacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        validarParticipante(solicitacao, usuario);
        return agendamentoService.agendar(solicitacao, usuario, req.dataHora(), req.localEncontro());
    }

    @PostMapping("/{id}/gerar-codigo")
    public Agendamento gerarCodigo(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Agendamento agendamento = buscar(id);
        validarParticipante(agendamento.getSolicitacao(), usuario);
        return agendamentoService.gerarCodigo(agendamento, usuario);
    }

    @PostMapping("/{id}/confirmar-agendamento")
    public Agendamento confirmarAgendamento(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Agendamento agendamento = buscar(id);
        validarParticipante(agendamento.getSolicitacao(), usuario);
        return agendamentoService.confirmarAgendamento(agendamento, usuario);
    }

    @PostMapping("/{id}/confirmar-doador")
    public Agendamento confirmarDoador(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Agendamento agendamento = buscar(id);
        validarParticipante(agendamento.getSolicitacao(), usuario);
        return agendamentoService.confirmarPorDoador(agendamento, usuario);
    }

    @PostMapping("/{id}/confirmar-receptor")
    public Agendamento confirmarReceptor(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Agendamento agendamento = buscar(id);
        validarParticipante(agendamento.getSolicitacao(), usuario);
        return agendamentoService.confirmarPorReceptor(agendamento, usuario);
    }

    @PostMapping("/{id}/confirmar-qrcode")
    public Agendamento confirmarQrCode(@PathVariable String id, @RequestParam String token,
                                      @AuthenticationPrincipal Usuario usuario) {
        Agendamento agendamento = buscar(id);
        validarParticipante(agendamento.getSolicitacao(), usuario);
        return agendamentoService.confirmarPorQrCode(agendamento, token, usuario);
    }

    @PostMapping("/{id}/reportar-problema")
    public void reportarProblema(@PathVariable String id, @AuthenticationPrincipal Usuario usuario) {
        Agendamento agendamento = buscar(id);
        validarParticipante(agendamento.getSolicitacao(), usuario);
        agendamentoService.reportarProblema(agendamento);
    }

    private Agendamento buscar(String id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado"));
    }

    private void validarParticipante(Solicitacao solicitacao, Usuario usuario) {
        boolean participante = solicitacao.getItem() != null
                && solicitacao.getItem().getDoador() != null
                && solicitacao.getReceptor() != null
                && (solicitacao.getItem().getDoador().getId().equals(usuario.getId())
                || solicitacao.getReceptor().getId().equals(usuario.getId()));
        if (!participante) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta troca");
    }
}
