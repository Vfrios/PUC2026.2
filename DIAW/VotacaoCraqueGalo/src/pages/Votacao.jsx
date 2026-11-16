import { useState } from 'react';
import { Link } from 'react-router-dom';
import JogadorCard from '../components/JogadorCard';
import {
  listarPorSituacao,
  obterSuspenso,
  registrarVoto,
} from '../services/votacaoService';

function Votacao() {
  const indicados = listarPorSituacao('indicado');
  const elenco = listarPorSituacao('elenco');
  const suspenso = obterSuspenso();

  const [selecionado, setSelecionado] = useState(null);
  const [historico, setHistorico] = useState([]);

  function handleConfirmar() {
    registrarVoto(selecionado.id);
    setHistorico([...historico, selecionado.nome]);
    setSelecionado(null);
  }

  return (
    <main className="pagina votacao">
      <h1 className="titulo-pagina">Quem foi o craque do jogo?</h1>
      <p className="subtitulo">Selecione um dos indicados e confirme o seu voto.</p>

      <section className="grade-indicados">
        {indicados.map((j) => (
          <JogadorCard
            key={j.id}
            jogador={j}
            selecionado={selecionado?.id === j.id}
            onSelecionar={setSelecionado}
          />
        ))}
      </section>

      <div className="confirmacao">
        <p>
          {selecionado ? (
            <>
              Seu voto vai para <strong>{selecionado.nome}</strong>.
            </>
          ) : (
            'Nenhum jogador selecionado.'
          )}
        </p>
        <button
          type="button"
          className="botao botao-principal"
          disabled={!selecionado}
          onClick={handleConfirmar}
        >
          Confirmar voto
        </button>
      </div>

      {historico.length > 0 && (
        <section className="historico">
          <h2>
            Seus votos nesta sessão: {historico.length} {historico.length === 1 ? 'voto' : 'votos'}
          </h2>
          <ol>
            {historico.map((nome, i) => (
              <li key={i}>{nome}</li>
            ))}
          </ol>
          <Link to="/resultado">Ver parcial</Link>
        </section>
      )}

      {suspenso && (
        <section className="secao">
          <h2>Suspenso</h2>
          <p className="subtitulo">Não entrou em campo e não pode receber votos.</p>
          <div className="grade-elenco">
            <JogadorCard jogador={suspenso} />
          </div>
        </section>
      )}

      <section className="secao">
        <h2>Elenco</h2>
        <p className="subtitulo">Demais jogadores do elenco.</p>
        <div className="grade-elenco">
          {elenco.map((j) => (
            <JogadorCard key={j.id} jogador={j} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Votacao;
