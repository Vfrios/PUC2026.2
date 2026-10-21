

public boolean estahNoDia(LocalDate data) {
    if (data == null || horario == null)
        return false;
    return horario.toLocalDate().equals(data);
}



public ConsultaAgendada(String paciente, LocalDateTime hora, EEspecialidade espec) {
    LocalDate data = LocalDate.from(hora);
    long dias = LocalDate.now().until(data, ChronoUnit.DAYS);
    if (dias < ANTECEDENCIA_MINIMA)
        hora = LocalDateTime.now().plusDays(ANTECEDENCIA_MINIMA);
    super(paciente, hora, espec);

    long diasAntecedencia = LocalDate.now().until(horario.toLocalDate(), ChronoUnit.DAYS);
    if (diasAntecedencia > ANTECEDENCIA_DESCONTO) {
        valorDesconto = especialidade.valor() * PCT_DESCONTO;
    } else {
        valorDesconto = 0.0;
    }
}


// import java.time.temporal.ChronoUnit;

public ConsultaRetorno(LocalDateTime hora, Consulta original) {
    super(original != null ? original.nomePaciente : null,
          hora,
          original != null ? original.especialidade : null);
    this.consultaAnterior = original;
}

public double valorConsulta() {
    if (consultaAnterior == null)
        return especialidade.valor();

    long dias = consultaAnterior.horario.toLocalDate()
                    .until(this.horario.toLocalDate(), ChronoUnit.DAYS);

    if (dias <= INTERVALO_MAXIMO) {
        return 0.0;
    }
    return especialidade.valor();
}



public String agendaDoDia(LocalDate dia) {
    StringBuilder sb = new StringBuilder();
    sb.append("Agenda do dia ").append(dia).append(":\n");

    boolean encontrou = false;
    for (Consulta c : agenda) {
        if (c.estahNoDia(dia)) {
            sb.append(c.toString()).append("\n");
            encontrou = true;
        }
    }

    if (!encontrou) {
        sb.append("Nenhuma consulta agendada para este dia.\n");
    }
    return sb.toString();
}



import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

public class ConsultaTest {

    @Test
    public void testValorConsultaAgendadaComDesconto() {
        LocalDateTime dataFutura = LocalDateTime.now().plusDays(30);
        ConsultaAgendada consulta = new ConsultaAgendada(
                "Maria", dataFutura, EEspecialidade.DERMATOLOGIA);

        double esperado = 200.0 * 0.70;
        assertEquals(esperado, consulta.valorConsulta(), 0.001);
    }
}
