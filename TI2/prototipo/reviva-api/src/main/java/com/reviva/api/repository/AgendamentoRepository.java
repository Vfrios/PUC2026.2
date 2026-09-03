package com.reviva.api.repository;

import com.reviva.api.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface AgendamentoRepository extends JpaRepository<Agendamento, String> {
    Optional<Agendamento> findBySolicitacaoId(String solicitacaoId);

    List<Agendamento> findBySolicitacao_Item_IdAndStatusIn(String itemId, Collection<Agendamento.StatusAgendamento> statuses);

    List<Agendamento> findByStatusAndDataHoraBetween(Agendamento.StatusAgendamento status, Instant from, Instant to);
}
