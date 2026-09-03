const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'reviva-api', 'db', 'reviva.db');
const db = new sqlite3.Database(dbPath);
db.configure('busyTimeout', 15000);

console.log('🚀 REVIVA - USUÁRIOS INTERAGINDO');
console.log('='.repeat(60));

const SENHA = 'UserTeste123';
// BCrypt do backend; nunca grave a senha em texto puro no SQLite.
const SENHA_HASH = '$2a$10$coTOIiAp3zuep4u9z8lGJ.amF.bzyE5XK4BQ/VIi.kB.wtHS7x57W';
const agora = () => Date.now();

// ============ USUÁRIO 1 ============
const usuario1 = {
  nome: 'Rafael Monteiro',
  email: 'rafael.monteiro@reviva.com',
  cpf: '529.982.247-25',
  telefone: '(31) 98888-2001',
  itens: 5,
  kg: 28.5,
  pontos: 75,
  selo: 'PRATA',
  reputacao: 4.8,
  lat: -19.8500,
  lng: -43.9800,
  raio: 25,
  lock: 80,
  cep: '31030-000',
  numero: '500',
  complemento: 'Apto 1201',
  bairro: 'Santo Antonio',
  online: true
};

// ============ USUÁRIO 2 ============
const usuario2 = {
  nome: 'Leticia Castro',
  email: 'leticia.castro@reviva.com',
  cpf: '390.533.447-05',
  telefone: '(31) 98888-2002',
  itens: 2,
  kg: 6.3,
  pontos: 25,
  selo: 'BRONZE',
  reputacao: 4.6,
  lat: -19.8550,
  lng: -43.9750,
  raio: 18,
  lock: 81,
  cep: '31030-000',
  numero: '500',
  complemento: 'Apto 805',
  bairro: 'Santo Antonio',
  online: true
};

// ============ ITENS DO USUÁRIO 1 ============
const itensUsuario1 = [
  {
    titulo: 'Violao de Estudo',
    categoria: 'OUTROS',
    descricao: 'Violao acustico para iniciante, com cordas novas e capa',
    conservacao: 'SEMINOVO',
    co2: 4.5,
    peso: 2.0,
    keyword: 'guitar,acoustic',
    bairro: 'Santo Antonio',
    cep: '31030-000',
    numero: '500'
  },
  {
    titulo: 'Cadeira de Escritorio',
    categoria: 'MOVEIS',
    descricao: 'Cadeira ergonomica com apoio lombar e ajuste de altura',
    conservacao: 'USADO',
    co2: 7.8,
    peso: 12.0,
    keyword: 'chair,office',
    bairro: 'Santo Antonio',
    cep: '31030-000',
    numero: '500'
  },
  {
    titulo: 'Fone de Ouvido Bluetooth',
    categoria: 'ELETRONICOS',
    descricao: 'Fone over-ear com cancelamento de ruido e case',
    conservacao: 'SEMINOVO',
    co2: 1.2,
    peso: 0.5,
    keyword: 'headphones,bluetooth',
    bairro: 'Santo Antonio',
    cep: '31030-000',
    numero: '500'
  }
];

// ============ ITENS DO USUÁRIO 2 ============
const itensUsuario2 = [
  {
    titulo: 'Livro de Culinaria Italiana',
    categoria: 'LIVROS',
    descricao: 'Livro com receitas italianas autenticas, capa dura',
    conservacao: 'SEMINOVO',
    co2: 1.5,
    peso: 1.0,
    keyword: 'cookbook,italian',
    bairro: 'Santo Antonio',
    cep: '31030-000',
    numero: '500'
  },
  {
    titulo: 'Luminaria de Mesa',
    categoria: 'MOVEIS',
    descricao: 'Luminaria artesanal com cupula de vidro colorido',
    conservacao: 'SEMINOVO',
    co2: 2.8,
    peso: 1.5,
    keyword: 'lamp,decorative',
    bairro: 'Santo Antonio',
    cep: '31030-000',
    numero: '500'
  }
];

// ============ CONVERSA COMPLETA ============
const conversa = [
  { remetente: 'leticia', texto: 'Ola Rafael! Vi que voce tem um violao para doar. Eu sempre quis aprender a tocar!', tempo: 1 },
  { remetente: 'rafael', texto: 'Ola Leticia! Ele esta em otimo estado, com cordas novas e uma capa.', tempo: 2 },
  { remetente: 'leticia', texto: 'Que legal! Voce pode me mandar uma foto dele e das medidas?', tempo: 3 },
  { remetente: 'rafael', texto: 'Claro. Ele tem 1 metro e 5 centimetros e deixei as fotos no anuncio.', tempo: 4 },
  { remetente: 'leticia', texto: 'Vi as fotos. Tambem gostei do fone de ouvido, estou precisando de um para estudar.', tempo: 5 },
  { remetente: 'rafael', texto: 'O fone funciona perfeitamente e a bateria dura quase o dia todo.', tempo: 6 },
  { remetente: 'leticia', texto: 'Eu tenho um livro de culinaria italiana e uma luminaria artesanal para trocar.', tempo: 7 },
  { remetente: 'rafael', texto: 'Eu adoro cozinhar e estava procurando uma luminaria para a mesa do escritorio.', tempo: 8 },
  { remetente: 'leticia', texto: 'Podemos fazer a troca: violao e fone pelo livro e pela luminaria.', tempo: 9 },
  { remetente: 'rafael', texto: 'Para mim esta otimo. Vou conferir se o fone esta carregado antes de separar tudo.', tempo: 10 },
  { remetente: 'leticia', texto: 'Sem pressa. Quero que os dois lados fiquem confortaveis com a troca.', tempo: 11 },
  { remetente: 'rafael', texto: 'Conferi agora: o violao esta afinado e o fone esta com o case e o cabo.', tempo: 12 },
  { remetente: 'leticia', texto: 'Perfeito! O livro esta bem conservado e a luminaria funciona normalmente.', tempo: 13 },
  { remetente: 'rafael', texto: 'Voce prefere fazer a retirada na portaria do seu predio?', tempo: 14 },
  { remetente: 'leticia', texto: 'Sim, moramos no mesmo bairro e a portaria fica aberta ate tarde.', tempo: 15 },
  { remetente: 'rafael', texto: 'Moro no Santo Antonio tambem. Podemos nos encontrar na recepcao.', tempo: 16 },
  { remetente: 'leticia', texto: 'Que coincidencia! Hoje depois das 19h funciona para voce?', tempo: 17 },
  { remetente: 'rafael', texto: 'Funciona sim. Vou criar o agendamento pelo aplicativo para deixar tudo registrado.', tempo: 18 },
  { remetente: 'rafael', texto: '{"tipo":"AGENDAMENTO_CRIADO","dataHora":"2026-09-03T22:00:00Z","local":"Portaria do Ed. Alameda, Funcionarios"}', tempo: 19 },
  { remetente: 'leticia', texto: 'Recebi o agendamento. A data, o horario e o local estao corretos.', tempo: 20 },
  { remetente: 'leticia', texto: '{"tipo":"AGENDAMENTO_CONFIRMADO"}', tempo: 21 },
  { remetente: 'rafael', texto: 'Perfeito, vou levar os dois itens embalados para nao danificar nada.', tempo: 22 },
  { remetente: 'rafael', texto: 'Quando chegar, vou mostrar o codigo de retirada para voce confirmar no app.', tempo: 23 },
  { remetente: 'leticia', texto: 'Combinado. Assim que eu receber os itens, confiro tudo e digito o codigo.', tempo: 24 },
  { remetente: 'leticia', texto: 'Cheguei na portaria. Estou usando uma blusa azul.', tempo: 25 },
  { remetente: 'rafael', texto: 'Tambem cheguei. Estou com o violao na capa preta e uma sacola verde.', tempo: 26 },
  { remetente: 'leticia', texto: 'Recebi o violao e o fone, esta tudo conforme combinamos.', tempo: 27 },
  { remetente: 'leticia', texto: '{"tipo":"RETIRADA_CONFIRMADA"}', tempo: 28 },
  { remetente: 'rafael', texto: 'Troca concluida com sucesso. Obrigado pela confianca!', tempo: 29 },
  { remetente: 'leticia', texto: 'Eu que agradeco! Vou avaliar a troca pelo aplicativo.', tempo: 30 }
];

let cont = { u: 0, i: 0, f: 0, s: 0, m: 0, a: 0, av: 0, n: 0 };

async function main() {
  const uid1 = crypto.randomUUID();
  const uid2 = crypto.randomUUID();
  
  console.log('👥 Criando usuários...\n');
  
  // Inserir usuário 1
  await new Promise(r => {
    db.run('INSERT INTO usuarios (id, criado_em, email, email_verificado, foto_url, itens_doados, kg_residuo_evitado, latitude, longitude, nome, pontos, raio_busca_km, reputacao_score, selo_atual, senha_hash, telefone, telefone_verificado, cep, complemento, numero, cpf) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [uid1, agora(), usuario1.email, 1, 'https://loremflickr.com/200/200/face,portrait/all?lock='+usuario1.lock,
      usuario1.itens, usuario1.kg, usuario1.lat, usuario1.lng, usuario1.nome, usuario1.pontos, usuario1.raio,
       usuario1.reputacao, usuario1.selo, SENHA_HASH, usuario1.telefone, 1, usuario1.cep, usuario1.complemento, usuario1.numero, usuario1.cpf],
      err => { if (err) console.error('❌ Usuário 1:', err.message); else { cont.u++; console.log('✅ Usuário 1:', usuario1.nome); } r(); });
  });
  
  // Inserir usuário 2
  await new Promise(r => {
    db.run('INSERT INTO usuarios (id, criado_em, email, email_verificado, foto_url, itens_doados, kg_residuo_evitado, latitude, longitude, nome, pontos, raio_busca_km, reputacao_score, selo_atual, senha_hash, telefone, telefone_verificado, cep, complemento, numero, cpf) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [uid2, agora()+50, usuario2.email, 1, 'https://loremflickr.com/200/200/face,portrait/all?lock='+usuario2.lock,
      usuario2.itens, usuario2.kg, usuario2.lat, usuario2.lng, usuario2.nome, usuario2.pontos, usuario2.raio,
       usuario2.reputacao, usuario2.selo, SENHA_HASH, usuario2.telefone, 1, usuario2.cep, usuario2.complemento, usuario2.numero, usuario2.cpf],
      err => { if (err) console.error('❌ Usuário 2:', err.message); else { cont.u++; console.log('✅ Usuário 2:', usuario2.nome); } r(); });
  });

  console.log('\n📦 Criando itens...\n');
  
  // Inserir itens do usuário 1
  const itensIds1 = [];
  const tokenRetirada = String(Math.floor(10000 + Math.random() * 90000));
  for (let i = 0; i < itensUsuario1.length; i++) {
    const item = itensUsuario1[i];
    const iid = crypto.randomUUID();
    itensIds1.push({id: iid, ...item});
    
    await new Promise(r => {
      db.run('INSERT INTO itens (id, bairro, categoria, cidade, descricao, estado_conservacao, expira_em, impacto_co2kg, latitude, longitude, publicado_em, qr_code_token, status, tipo_publicacao, titulo, uf, doador_id, cep, complemento, numero, peso_kg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [iid, item.bairro, item.categoria, 'Belo Horizonte', item.descricao, item.conservacao,
         agora()+60*24*60*60*1000, item.co2, usuario1.lat+(i*0.001), usuario1.lng-(i*0.001), agora()+i, i === 0 ? tokenRetirada : '', 'ATIVO',
         'TROCAR', item.titulo, 'MG', uid1, item.cep, 'Recepcao do predio', item.numero, item.peso],
        () => {
          cont.i++;
          console.log('  📦 Rafael:', item.titulo);
          const foto = 'https://loremflickr.com/800/600/'+item.keyword+'/all?lock='+(800+i);
          db.run('INSERT INTO item_fotos_urls (item_id, foto_url) VALUES (?,?)', [iid, foto], () => { cont.f++; r(); });
        });
    });
  }
  
  // Inserir itens do usuário 2
  const itensIds2 = [];
  for (let i = 0; i < itensUsuario2.length; i++) {
    const item = itensUsuario2[i];
    const iid = crypto.randomUUID();
    itensIds2.push({id: iid, ...item});
    
    await new Promise(r => {
      db.run('INSERT INTO itens (id, bairro, categoria, cidade, descricao, estado_conservacao, expira_em, impacto_co2kg, latitude, longitude, publicado_em, qr_code_token, status, tipo_publicacao, titulo, uf, doador_id, cep, complemento, numero, peso_kg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [iid, item.bairro, item.categoria, 'Belo Horizonte', item.descricao, item.conservacao,
         agora()+60*24*60*60*1000, item.co2, usuario2.lat+(i*0.001), usuario2.lng-(i*0.001), agora()+i+10, '', 'ATIVO',
         'TROCAR', item.titulo, 'MG', uid2, item.cep, 'Recepcao do predio', item.numero, item.peso],
        () => {
          cont.i++;
          console.log('  📦 Leticia:', item.titulo);
          const foto = 'https://loremflickr.com/800/600/'+item.keyword+'/all?lock='+(810+i);
          db.run('INSERT INTO item_fotos_urls (item_id, foto_url) VALUES (?,?)', [iid, foto], () => { cont.f++; r(); });
        });
    });
  }

  console.log('\n💬 Criando conversa...\n');
  
  // Criar solicitação
  const sid = crypto.randomUUID();
  const itemViolao = itensIds1[0]; // Violao de Estudo
  
  await new Promise(r => {
    db.run('INSERT INTO solicitacoes (id, criada_em, mensagem, status, item_id, receptor_id) VALUES (?,?,?,?,?,?)',
      [sid, agora(), conversa[0].texto, 'ACEITA', itemViolao.id, uid2],
      () => {
        cont.s++;
        console.log('📝 Conversa: Leticia -> Rafael (Violao)');
        
        // Notificação para Rafael
        db.run('INSERT INTO notificacoes (id, criada_em, lida, tipo, titulo, usuario_id, solicitacao_id) VALUES (?,?,?,?,?,?,?)',
          [crypto.randomUUID(), agora(), 0, 'CHAT', 'Leticia Castro enviou mensagem sobre Violao de Estudo', uid1, sid],
          () => { cont.n++; console.log('  🔔 Notificação para Rafael'); });
        
        // Inserir todas as mensagens
        let mensagensInseridas = 0;
        
        conversa.forEach((msg, index) => {
          const remetenteId = msg.remetente === 'leticia' ? uid2 : uid1;
          
          db.run('INSERT INTO mensagens (id, criada_em, texto, remetente_id, solicitacao_id) VALUES (?,?,?,?,?)',
            [crypto.randomUUID(), agora() + index * 30 * 1000, msg.texto, remetenteId, sid],
            (err) => {
              if (!err) {
                mensagensInseridas++;
                cont.m++;
                
                const prefixo = msg.remetente === 'leticia' ? '👩 Leticia' : '👨 Rafael';
                console.log('  ' + prefixo + ': ' + msg.texto.substring(0, 70) + (msg.texto.length > 70 ? '...' : ''));
                
                if (mensagensInseridas === conversa.length) {
                  // Criar agendamento
                  const aid = crypto.randomUUID();
                  
                  db.run('INSERT INTO agendamentos (id, confirmacao_agendamento_receptor_em, confirmacao_doador_em, confirmacao_receptor_em, data_hora, lembrete1h_enviado, lembrete24h_enviado, local_encontro, status, solicitacao_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
                    [aid, agora()-180*1000, agora()-120*1000, agora()-60*1000, agora()+43200*1000, 0, 0, 'Recepcao do predio - Santo Antonio', 'CONCLUIDO', sid],
                    () => {
                      cont.a++;
                      console.log('\n  📅 Agendamento: Recepcao do predio');
                      
                      // Avaliação mútua
                      db.run('INSERT INTO avaliacoes (id, comentario, criada_em, nota, agendamento_id, avaliado_id, avaliador_id) VALUES (?,?,?,?,?,?,?)',
                        [crypto.randomUUID(), 'Rafael e super gentil! O violao esta perfeito! Troca maravilhosa!', agora()+100*1000, 5, aid, uid1, uid2],
                        () => {
                          cont.av++;
                          console.log('  ⭐ Leticia avaliou Rafael: 5 estrelas');
                        });
                      
                      db.run('INSERT INTO avaliacoes (id, comentario, criada_em, nota, agendamento_id, avaliado_id, avaliador_id) VALUES (?,?,?,?,?,?,?)',
                        [crypto.randomUUID(), 'Leticia e muito atenciosa! Adorei o livro e a luminaria! Recomendo!', agora()+110*1000, 5, aid, uid2, uid1],
                        () => {
                          cont.av++;
                          console.log('  ⭐ Rafael avaliou Leticia: 5 estrelas');
                          r();
                        });
                    });
                }
              }
            });
        });
      });
  });

  // Resumo
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 INTERAÇÃO CRIADA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('👥 Usuários:', cont.u);
    console.log('📦 Itens:', cont.i);
    console.log('📸 Fotos:', cont.f);
    console.log('📝 Conversas:', cont.s);
    console.log('💬 Mensagens:', cont.m);
    console.log('📅 Agendamentos:', cont.a);
    console.log('⭐ Avaliações:', cont.av);
    console.log('🔔 Notificações:', cont.n);
    console.log('='.repeat(60));
    
    console.log('\n📋 LOGINS:');
    console.log('='.repeat(60));
    console.log('Usuário 1 (pode doar e receber):');
    console.log('  Nome: Rafael Monteiro');
    console.log('  Email: rafael.monteiro@reviva.com');
    console.log('  Senha: UserTeste123');
    console.log('  CPF: 111.222.333-44');
    console.log('  Status: Online');
    console.log('');
    console.log('Usuário 2 (pode doar e receber):');
    console.log('  Nome: Leticia Castro');
    console.log('  Email: leticia.castro@reviva.com');
    console.log('  Senha: UserTeste123');
    console.log('  CPF: 555.666.777-88');
    console.log('  Status: Online');
    console.log('='.repeat(60));
    
    console.log('\n💬 RESUMO DA INTERAÇÃO:');
    console.log('='.repeat(60));
    console.log('• 31 mensagens trocadas');
    console.log('• Troca combinada: Violão + Fone = Livro + Luminária');
    console.log('• Encontro na recepção do prédio');
    console.log('• Avaliações mútuas de 5 estrelas');
    console.log('• Ambos moram no mesmo prédio!');
    console.log('='.repeat(60));
    
    db.close();
  }, 2000);
}

main().catch(err => { console.error('❌ Erro:', err); db.close(); });
