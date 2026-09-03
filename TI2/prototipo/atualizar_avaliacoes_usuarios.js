const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'reviva-api', 'db', 'reviva.db');
const db = new sqlite3.Database(dbPath);
db.configure('busyTimeout', 15000);

const agora = Date.now();
const notas = [5, 4, 5, 5, 4, 5, 4, 5, 5, 4];
const pontos = [50, 75, 100, 125, 150, 175, 220, 280, 350, 60];

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (error) {
    if (error) reject(error);
    else resolve(this);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});

function seloParaPontos(valor) {
  if (valor >= 350) return 'ESMERALDA';
  if (valor >= 150) return 'OURO';
  if (valor >= 50) return 'PRATA';
  return 'BRONZE';
}

async function atualizarUsuario(usuario, avaliador, item, indice) {
  const chave = `Carga sem mensagens ${usuario.id}`;
  const agendamentoExistente = (await all(
    'SELECT id FROM agendamentos WHERE local_encontro = ?', [chave]
  ))[0];
  if (agendamentoExistente) return false;

  const momento = agora - (indice + 1) * 60 * 60 * 1000;
  const solicitacaoId = crypto.randomUUID();
  const agendamentoId = crypto.randomUUID();
  const avaliacaoId = crypto.randomUUID();
  const nota = notas[indice % notas.length];

  await run(`INSERT INTO solicitacoes
    (id, criada_em, mensagem, status, item_id, receptor_id)
    VALUES (?, ?, ?, ?, ?, ?)`, [
    solicitacaoId,
    momento,
    'Solicitacao de teste para registrar avaliacao',
    'ACEITA',
    item.id,
    usuario.id
  ]);

  await run(`INSERT INTO agendamentos
    (id, confirmacao_doador_em, confirmacao_receptor_em, data_hora,
     lembrete1h_enviado, lembrete24h_enviado, local_encontro, status, solicitacao_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    agendamentoId,
    momento,
    momento,
    momento,
    0,
    0,
    chave,
    'CONCLUIDO',
    solicitacaoId
  ]);

  await run(`INSERT INTO avaliacoes
    (id, comentario, criada_em, nota, agendamento_id, avaliado_id, avaliador_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    avaliacaoId,
    'Experiencia excelente. Usuario atencioso e negociacao concluida conforme combinado.',
    momento,
    nota,
    agendamentoId,
    usuario.id,
    avaliador.id
  ]);

  const valorPontos = pontos[indice % pontos.length];
  await run(`UPDATE usuarios
    SET reputacao_score = ?, pontos = ?, selo_atual = ?
    WHERE id = ?`, [
    nota,
    valorPontos,
    seloParaPontos(valorPontos),
    usuario.id
  ]);

  return true;
}

async function main() {
  const usuarios = await all(`
    SELECT id, nome, email, reputacao_score, selo_atual
    FROM usuarios
    WHERE reputacao_score IS NULL OR reputacao_score = 0
    ORDER BY email
  `);
  const itens = await all(`
    SELECT id, doador_id, titulo
    FROM itens
    WHERE status = 'ATIVO'
    ORDER BY publicado_em
  `);

  if (usuarios.length === 0) {
    console.log('Nenhum usuario sem avaliacao foi encontrado.');
    db.close();
    return;
  }
  if (itens.length === 0) {
    throw new Error('Nao existem anuncios ATIVO para vincular as avaliacoes.');
  }

  const itensPorDoador = new Map();
  for (const item of itens) {
    if (!itensPorDoador.has(item.doador_id)) itensPorDoador.set(item.doador_id, item);
  }
  const avaliadores = usuarios.filter(usuario => itensPorDoador.has(usuario.id));
  if (avaliadores.length === 0) {
    throw new Error('Nenhum usuario elegivel possui anuncio ATIVO para avaliar os demais.');
  }

  let atualizados = 0;
  let semAnuncioDoAvaliador = 0;
  for (let indice = 0; indice < usuarios.length; indice++) {
    const usuario = usuarios[indice];
    let avaliador = avaliadores[indice % avaliadores.length];
    if (avaliador.id === usuario.id && avaliadores.length > 1) {
      avaliador = avaliadores[(indice + 1) % avaliadores.length];
    }
    const item = itensPorDoador.get(avaliador.id);
    if (!item) {
      semAnuncioDoAvaliador++;
      continue;
    }
    if (await atualizarUsuario(usuario, avaliador, item, indice)) atualizados++;
  }

  console.log(`Usuarios sem avaliacao encontrados: ${usuarios.length}`);
  console.log(`Usuarios atualizados: ${atualizados}`);
  console.log(`Agendamentos e avaliacoes criados: ${atualizados}`);
  console.log(`Sem mensagens criadas: sim${semAnuncioDoAvaliador ? ` (${semAnuncioDoAvaliador} sem item avaliador)` : ''}`);
  db.close();
}

main().catch(error => {
  console.error('Erro na atualizacao:', error.message);
  db.close();
  process.exitCode = 1;
});
