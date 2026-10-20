package com.reviva.api.service;
import com.reviva.api.dto.DenunciaRequest;
import com.reviva.api.model.Agendamento;
import com.reviva.api.model.Denuncia;
import com.reviva.api.model.Item;
import com.reviva.api.model.Solicitacao;
import com.reviva.api.model.Usuario;
import com.reviva.api.repository.AgendamentoRepository;
import com.reviva.api.repository.DenunciaRepository;
import com.reviva.api.repository.ItemRepository;
import com.reviva.api.repository.SolicitacaoRepository;
import com.reviva.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DenunciaService {

    private final DenunciaRepository denunciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ItemRepository itemRepository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final AgendamentoRepository agendamentoRepository;

    public Denuncia registrar(DenunciaRequest request, Usuario denunciante) {
        Item item = request.itemId() == null ? null : itemRepository.findById(request.itemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado."));
        Solicitacao solicitacao = request.solicitacaoId() == null ? null : solicitacaoRepository.findValidById(request.solicitacaoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversa não encontrada."));
        Agendamento agendamento = request.agendamentoId() == null ? null : agendamentoRepository.findById(request.agendamentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado."));

        if (agendamento != null) {
            Solicitacao doAgendamento = agendamento.getSolicitacao();
            if (solicitacao != null && (doAgendamento == null || !solicitacao.getId().equals(doAgendamento.getId()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agendamento e conversa incompatíveis.");
            }
            if (solicitacao == null) solicitacao = doAgendamento;
        }

        if (item != null && solicitacao != null && solicitacao.getItem() != null
                && !item.getId().equals(solicitacao.getItem().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item e conversa incompatíveis.");
        }

        String denunciadoId = request.usuarioDenunciadoId();
        if (solicitacao != null) {
            String participanteOposto = participanteOposto(solicitacao, denunciante);
            if (denunciadoId != null && !denunciadoId.equals(participanteOposto)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário denunciado não participa desta conversa.");
            }
            denunciadoId = participanteOposto;
        }
        if (item != null && item.getDoador() != null) {
            String anuncianteId = item.getDoador().getId();
            if (denunciadoId != null && !denunciadoId.equals(anuncianteId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário denunciado não corresponde ao anunciante.");
            }
            if (denunciadoId == null) denunciadoId = anuncianteId;
        }
        if (denunciadoId == null || denunciadoId.equals(denunciante.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe outro usuário para a denúncia.");
        }
        Usuario denunciado = usuarioRepository.findById(denunciadoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário denunciado não encontrado."));

        Denuncia denuncia = Denuncia.builder()
                .denunciante(denunciante)
                .denunciado(denunciado)
                .item(item)
                .solicitacao(solicitacao)
                .agendamento(agendamento)
                .motivo(request.motivo())
                .detalhes(request.detalhes())
                .status(Denuncia.StatusDenuncia.ABERTA)
                .build();
        return denunciaRepository.save(denuncia);
    }

    private String participanteOposto(Solicitacao solicitacao, Usuario denunciante) {
        String receptorId = solicitacao.getReceptor() == null ? null : solicitacao.getReceptor().getId();
        String doadorId = solicitacao.getDoadorId();
        if (doadorId == null && solicitacao.getItem() != null && solicitacao.getItem().getDoador() != null) {
            doadorId = solicitacao.getItem().getDoador().getId();
        }
        if (denunciante.getId().equals(receptorId)) return doadorId;
        if (denunciante.getId().equals(doadorId)) return receptorId;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta conversa.");
    }
}
