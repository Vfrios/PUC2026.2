package com.reviva.api.controller;

import com.reviva.api.dto.AgendamentoRequest;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.reviva.api.service.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** Cobre: Agendamento (Doador/Receptor), Confirmação de Doação e Confirmação de Recebimento. */
@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;
    private final AgendamentoRepository agendamentoRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    @PostMapping
    public Agendamento agendar(@RequestBody @Valid AgendamentoRequest req) {
        Solicitacao solicitacao = solicitacaoRepository.findById(req.solicitacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        return agendamentoService.agendar(solicitacao, req.dataHora(), req.localEncontro());
    }

    @PostMapping("/{id}/confirmar-doador")
    public Agendamento confirmarDoador(@PathVariable String id) {
        return agendamentoService.confirmarPorDoador(buscar(id));
    }

    @PostMapping("/{id}/confirmar-receptor")
    public Agendamento confirmarReceptor(@PathVariable String id) {
        return agendamentoService.confirmarPorReceptor(buscar(id));
    }

    @PostMapping("/{id}/confirmar-qrcode")
    public Agendamento confirmarQrCode(@PathVariable String id, @RequestParam String token) {
        return agendamentoService.confirmarPorQrCode(buscar(id), token);
    }

    @PostMapping("/{id}/reportar-problema")
    public void reportarProblema(@PathVariable String id) {
        agendamentoService.reportarProblema(buscar(id));
    }

    private Agendamento buscar(String id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado"));
    }
}
