package com.reviva.api.repository;

import com.reviva.api.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, String> {
    List<Agendamento> findByStatusAndDataHoraBetween(Agendamento.StatusAgendamento status, Instant from, Instant to);
}
