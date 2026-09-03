const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'reviva-api', 'db', 'reviva.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 REVIVA - 2 USUÁRIOS INTERAGINDO');
console.log('='.repeat(60));

const SENHA = 'UserTeste123';
// BCrypt do backend; nunca grave a senha em texto puro no SQLite.
const SENHA_HASH = '$2a$10$coTOIiAp3zuep4u9z8lGJ.amF.bzyE5XK4BQ/VIi.kB.wtHS7x57W';
const agora = () => Date.now();

// ============ USUÁRIO 1: DOADOR ============
const usuario1 = {
  nome: 'Rafael Monteiro',
  email: 'rafael.monteiro@reviva.com',
  perfil: 'DOADOR',
  cpf: '111.222.333-44',
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

// ============ USUÁRIO 2: RECEPTOR ============
const usuario2 = {
  nome: 'Leticia Castro',
  email: 'leticia.castro@reviva.com',
  perfil: 'RECEPTOR',
  cpf: '555.666.777-88',
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

// ============ ITENS DO USUÁRIO 1 (DOADOR) ============
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

// ============ ITENS DO USUÁRIO 2 (RECEPTOR) ============
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
  { remetente: 'leticia', texto: 'Ola Rafael! Vi que voce tem um violao para doar! Eu sempre quis aprender a tocar! 🎸', tempo: 1 },
  { remetente: 'rafael', texto: 'Ola Leticia! Que otimo! Ele esta em otimo estado, comprei para aprender mas acabei nao tendo tempo.', tempo: 2 },
  { remetente: 'leticia', texto: 'Eu entendo! A correria do dia a dia e complicada mesmo. Voce tem mais algum item de musica?', tempo: 3 },
  { remetente: 'rafael', texto: 'No momento so o violao mesmo. Mas vi que voce tem um livro de culinaria italiana! Eu adoro cozinhar!', tempo: 4 },
  { remetente: 'leticia', texto: 'Sim! Ganhei de presente mas ja tenho varios livros de culinaria. Podemos fazer uma troca!', tempo: 5 },
  { remetente: 'rafael', texto: 'Perfeito! Troco o violao pelo seu livro de culinaria italiana. O que acha?', tempo: 6 },
  { remetente: 'leticia', texto: 'Fechado! Vi que voce tambem tem um fone de ouvido bluetooth. Eu estou precisando de um para estudar!', tempo: 7 },
  { remetente: 'rafael', texto: 'Tenho sim! Ele e muito bom, a bateria dura bastante. Podemos incluir na troca se voce tiver mais algo.', tempo: 8 },
  { remetente: 'leticia', texto: 'Tenho uma luminaria de mesa artesanal linda! Ficaria otima no seu escritorio.', tempo: 9 },
  { remetente: 'rafael', texto: 'Nossa, eu estava mesmo procurando uma luminaria! Fechado entao! Violao + Fone = Livro + Luminaria!', tempo: 10 },
  { remetente: 'leticia', texto: 'Perfeito! Vi que voce mora no Santo Antonio, no mesmo predio que eu! Que coincidencia!', tempo: 11 },
  { remetente: 'rafael', texto: 'Serio? Que otimo! Entao podemos nos encontrar na recepcao do predio!', tempo: 12 },
  { remetente: 'leticia', texto: 'Perfeito! Que tal hoje a noite, umas 19h?', tempo: 13 },
  { remetente: 'rafael', texto: 'Combinado! Vou separar o violao e o fone. Ate logo!', tempo: 14 },
  { remetente: 'leticia', texto: 'Ate logo! Vou confirmar tudo pelo aplicativo. 😊', tempo: 15 }
];

let cont = { u: 0, i: 0, f: 0, s: 0, m: 0, a: 0, av: 0, n: 0 };

async function main() {
  const uid1 = crypto.randomUUID();
  const uid2 = crypto.randomUUID();
  
  console.log('👥 Criando usuários...\n');
  
  // Inserir usuário 1
  await new Promise(r => {
    db.run('INSERT INTO usuarios (id, criado_em, email, email_verificado, foto_url, itens_doados, kg_residuo_evitado, latitude, longitude, nome, perfil_ativo, pontos, raio_busca_km, reputacao_score, selo_atual, senha_hash, telefone, telefone_verificado, cep, complemento, numero, cpf) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [uid1, agora(), usuario1.email, 1, 'https://loremflickr.com/200/200/face,portrait/all?lock='+usuario1.lock,
       usuario1.itens, usuario1.kg, usuario1.lat, usuario1.lng, usuario1.nome, usuario1.perfil, usuario1.pontos, usuario1.raio,
       usuario1.reputacao, usuario1.selo, SENHA_HASH, usuario1.telefone, 1, usuario1.cep, usuario1.complemento, usuario1.numero, usuario1.cpf],
      err => { if (err) console.error('❌ Usuário 1:', err.message); else { cont.u++; console.log('✅ Usuário 1:', usuario1.nome); } r(); });
  });
  
  // Inserir usuário 2
  await new Promise(r => {
    db.run('INSERT INTO usuarios (id, criado_em, email, email_verificado, foto_url, itens_doados, kg_residuo_evitado, latitude, longitude, nome, perfil_ativo, pontos, raio_busca_km, reputacao_score, selo_atual, senha_hash, telefone, telefone_verificado, cep, complemento, numero, cpf) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [uid2, agora()+50, usuario2.email, 1, 'https://loremflickr.com/200/200/face,portrait/all?lock='+usuario2.lock,
       usuario2.itens, usuario2.kg, usuario2.lat, usuario2.lng, usuario2.nome, usuario2.perfil, usuario2.pontos, usuario2.raio,
       usuario2.reputacao, usuario2.selo, SENHA_HASH, usuario2.telefone, 1, usuario2.cep, usuario2.complemento, usuario2.numero, usuario2.cpf],
      err => { if (err) console.error('❌ Usuário 2:', err.message); else { cont.u++; console.log('✅ Usuário 2:', usuario2.nome); } r(); });
  });

  console.log('\n📦 Criando itens...\n');
  
  // Inserir itens do usuário 1
  const itensIds1 = [];
  for (let i = 0; i < itensUsuario1.length; i++) {
    const item = itensUsuario1[i];
    const iid = crypto.randomUUID();
    itensIds1.push({id: iid, ...item});
    
    await new Promise(r => {
      db.run('INSERT INTO itens (id, bairro, categoria, cidade, descricao, estado_conservacao, impacto_co2kg, latitude, longitude, publicado_em, qr_code_token, status, tipo_publicacao, titulo, uf, doador_id, cep, complemento, numero, peso_kg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [iid, item.bairro, item.categoria, 'Belo Horizonte', item.descricao, item.conservacao, item.co2,
         usuario1.lat+(i*0.001), usuario1.lng-(i*0.001), agora()+i, '', 'ATIVO',
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
      db.run('INSERT INTO itens (id, bairro, categoria, cidade, descricao, estado_conservacao, impacto_co2kg, latitude, longitude, publicado_em, qr_code_token, status, tipo_publicacao, titulo, uf, doador_id, cep, complemento, numero, peso_kg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [iid, item.bairro, item.categoria, 'Belo Horizonte', item.descricao, item.conservacao, item.co2,
         usuario2.lat+(i*0.001), usuario2.lng-(i*0.001), agora()+i+10, '', 'ATIVO',
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
                  
                  db.run('INSERT INTO agendamentos (id, confirmacao_doador_em, confirmacao_receptor_em, data_hora, lembrete1h_enviado, lembrete24h_enviado, local_encontro, status, solicitacao_id) VALUES (?,?,?,?,?,?,?,?,?)',
                    [aid, agora(), agora()+60*1000, agora()+43200*1000, 0, 0, 'Recepcao do predio - Santo Antonio', 'CONCLUIDO', sid],
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
    console.log('Usuário 1 (Doador):');
    console.log('  Nome: Rafael Monteiro');
    console.log('  Email: rafael.monteiro@reviva.com');
    console.log('  Senha: UserTeste123');
    console.log('  CPF: 111.222.333-44');
    console.log('  Status: Online');
    console.log('');
    console.log('Usuário 2 (Receptor):');
    console.log('  Nome: Leticia Castro');
    console.log('  Email: leticia.castro@reviva.com');
    console.log('  Senha: UserTeste123');
    console.log('  CPF: 555.666.777-88');
    console.log('  Status: Online');
    console.log('='.repeat(60));
    
    console.log('\n💬 RESUMO DA INTERAÇÃO:');
    console.log('='.repeat(60));
    console.log('• 15 mensagens trocadas');
    console.log('• Troca combinada: Violão + Fone = Livro + Luminária');
    console.log('• Encontro na recepção do prédio');
    console.log('• Avaliações mútuas de 5 estrelas');
    console.log('• Ambos moram no mesmo prédio!');
    console.log('='.repeat(60));
    
    db.close();
  }, 2000);
}

main().catch(err => { console.error('❌ Erro:', err); db.close(); });
