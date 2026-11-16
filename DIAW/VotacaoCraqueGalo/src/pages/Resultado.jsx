import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  obterVotos,
  calcularResultado,
  desfazerUltimoVoto,
  zerarVotos,
} from '../services/votacaoService';

function textoVotos(n) {
  return `${n} ${n === 1 ? 'voto' : 'votos'}`;
}

function Resultado() {
  const [votos, setVotos] = useState(() => obterVotos());

  // valores derivados, calculados a cada renderização
  const total = votos.length;
  const resultado = calcularResultado(votos);

  const craque = resultado[0];
  const vice = resultado[1];
  const vantagem = craque.votos - vice.votos;

  function handleDesfazer() {
    setVotos(desfazerUltimoVoto());
  }

  function handleZerar() {
    if (window.confirm('Apagar todos os votos?')) {
      zerarVotos();
      setVotos([]); // o estado vazio é um array, e não {}
    }
  }

  return (
    <main className="pagina resultado">
      <h1 className="titulo-pagina">Parcial: Craque do Jogo</h1>
      <p className="total-votos">
        <strong>{total}</strong> votos computados
      </p>

      {total === 0 ? (
        <div className="sem-votos">
          <p>Nenhum voto ainda. Escolha o craque do jogo para ver a parcial.</p>
          <Link to="/votacao" className="botao botao-principal">
            Ir para a votação
          </Link>
        </div>
      ) : (
        <>
          <p className="disputa">
            {vantagem === 0
              ? `Empate na liderança entre ${craque.nome} e ${vice.nome}!`
              : `${craque.nome} lidera com ${textoVotos(vantagem)} de vantagem sobre ${vice.nome}.`}
          </p>

          <ul className="placar">
            {resultado.map((j, i) => (
              <li
                key={j.id}
                className={`placar-item${
                  i === 0 ? ' placar-craque' : i === 1 ? ' placar-vice' : ''
                }`}
              >
                <span className="placar-posicao">{i + 1}º</span>
                <img src={j.foto} alt={j.nome} className="placar-foto" />
                <div className="placar-info">
                  <div className="placar-nome">
                    <h2>{j.nome}</h2>
                    {i === 0 && <span className="selo-resultado selo-craque">Craque do jogo</span>}
                    {i === 1 && <span className="selo-resultado selo-vice">Vice</span>}
                  </div>
                  <div className="barra">
                    <div
                      className="barra-preenchida"
                      style={{ width: `${j.percentual}%` }}
                    />
                  </div>
                  <p className="placar-numeros">
                    {j.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% (
                    {textoVotos(j.votos)})
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="acoes-resultado">
            <button type="button" className="botao botao-claro" onClick={handleDesfazer}>
              Desfazer último voto
            </button>
            <button type="button" className="botao botao-contorno" onClick={handleZerar}>
              Zerar votação
            </button>
          </div>
        </>
      )}

    </main>
  );
}

export default Resultado;
