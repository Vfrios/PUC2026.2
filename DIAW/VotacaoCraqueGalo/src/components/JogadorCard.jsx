const SELOS = {
  indicado: 'Indicado',
  suspenso: 'Suspenso',
};

function JogadorCard({ jogador, selecionado = false, onSelecionar }) {
  const { nome, numero, posicao, foto, situacao } = jogador;
  const selo = SELOS[situacao]; // 'elenco' -> undefined

  return (
    <article className={`card card-${situacao}${selecionado ? ' card-selecionado' : ''}`}>
      {selo && <span className={`selo selo-${situacao}`}>{selo}</span>}
      <img src={foto} alt={nome} className="card-foto" />

      <div className="card-corpo">
        <h3 className="card-nome">
          <span className="card-numero">{numero}</span> {nome}
        </h3>
        <p className="card-posicao">{posicao}</p>

        {onSelecionar && (
          <button
            type="button"
            className={`card-botao${selecionado ? ' card-botao-ativo' : ''}`}
            onClick={() => onSelecionar(jogador)}
          >
            {selecionado ? '✓ Selecionado' : 'Selecionar'}
          </button>
        )}
      </div>
    </article>
  );
}

export default JogadorCard;
