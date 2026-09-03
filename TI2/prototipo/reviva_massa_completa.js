const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'reviva-api', 'db', 'reviva.db');
const db = new sqlite3.Database(dbPath);
db.configure('busyTimeout', 15000);
db.run('PRAGMA journal_mode = WAL');

console.log('🚀 REVIVA - USUÁRIO ESPECIAL + CONVERSA');
console.log('='.repeat(60));

// Usar senha em texto normal
const SENHA = 'UserTeste123';
const USUARIO_ALVO = '71a633a1-2318-4658-b26e-fe5d6dcd350e';
const agora = () => Date.now();

// ============ USUÁRIO ESPECIAL ============
const usuarioEspecial = {
  nome: 'Sofia Albuquerque',
  email: 'sofia.albuquerque@reviva.com',
  perfil: 'RECEPTOR',
  cpf: '678.901.234-56',
  telefone: '(31) 99999-8888',
  itens: 3,
  kg: 12.7,
  pontos: 30,
  selo: 'PRATA',
  reputacao: 4.8,
  lat: -19.8990,
  lng: -43.9350,
  raio: 15,
  lock: 70,
  cep: '30160-000',
  numero: '777',
  complemento: 'Casa 2 - Fundos',
  bairro: 'Santo Antonio',
  online: true,
  em_conversa_com: true
};

const itensEspeciais = [
  {
    titulo: 'Kit Jardinagem Completo',
    categoria: 'OUTROS',
    descricao: 'Kit com vasos, ferramentas e sementes organicas para iniciantes',
    conservacao: 'NOVO',
    co2: 3.5,
    keyword: 'gardening,plants',
    bairro: 'Santo Antonio'
  },
  {
    titulo: 'Luminaria de Mesa Artesanal',
    categoria: 'MOVEIS',
    descricao: 'Luminaria artesanal feita com madeira de demolicao',
    conservacao: 'SEMINOVO',
    co2: 2.8,
    keyword: 'lamp,handmade',
    bairro: 'Santo Antonio'
  },
  {
    titulo: 'Colecao de Receitas Vegetarianas',
    categoria: 'LIVROS',
    descricao: '5 livros de culinaria vegetariana e vegana',
    conservacao: 'SEMINOVO',
    co2: 2.2,
    keyword: 'cookbook,vegetarian',
    bairro: 'Santo Antonio'
  }
];

// ============ CONVERSA BACANA ============
const conversa = [
  { remetente: 'sofia', texto: 'Ola! Tudo bem? Vi que voce tem uns itens incriveis para doar! Parabens pela iniciativa! 🌟', tempo: 1 },
  { remetente: 'alvo', texto: 'Ola Sofia! Muito obrigado! Fico feliz que tenha gostado. O Reviva me ajudou muito a desapegar de coisas boas que nao usava mais.', tempo: 2 },
  { remetente: 'sofia', texto: 'Que legal! Eu estou comecando agora na plataforma. Estou procurando especialmente itens de cozinha e jardinagem.', tempo: 3 },
  { remetente: 'alvo', texto: 'Bem-vinda ao Reviva! Tenho certeza que vai encontrar muita coisa boa. Inclusive, acabei de ver que voce tambem tem itens para doar! Adorei o Kit de Jardinagem!', tempo: 4 },
  { remetente: 'sofia', texto: 'Ahh obrigada! Ganhei de presente mas acabei nao usando. Prefiro que va para alguem que realmente va aproveitar. Voce gosta de plantas?', tempo: 5 },
  { remetente: 'alvo', texto: 'Adoro! Tenho varias plantinhas em casa, mas sempre quis comecar uma horta. Seu kit seria perfeito para isso! 🌱', tempo: 6 },
  { remetente: 'sofia', texto: 'Que otimo! Entao podemos fazer uma troca! Eu me interesso por itens de cozinha e voce pelo kit de jardinagem. Perfeito, nao?', tempo: 7 },
  { remetente: 'alvo', texto: 'Perfeito! Tenho um jogo de panelas e alguns livros de receitas que podem te interessar. Vou verificar o que tenho disponivel.', tempo: 8 },
  { remetente: 'sofia', texto: 'Nossa, seria incrivel! Estou aprendendo a cozinhar e esses itens seriam muito uteis. Voce mora perto da Praca da Liberdade?', tempo: 9 },
  { remetente: 'alvo', texto: 'Moro sim! Fica a uns 10 minutos de la. Podemos combinar um encontro na praca para fazer a troca. O que acha?', tempo: 10 },
  { remetente: 'sofia', texto: 'Perfeito! Que tal amanha no final da tarde? Umas 17h?', tempo: 11 },
  { remetente: 'alvo', texto: 'Combinado! Amanha as 17h na entrada principal da Praca da Liberdade. Vou separar o jogo de panelas e os livros de receitas para voce.', tempo: 12 },
  { remetente: 'sofia', texto: 'Combinado! Vou levar o kit de jardinagem completo. Muito obrigada pela gentileza! 😊', tempo: 13 },
  { remetente: 'alvo', texto: 'Eu que agradeco! Vai ser otimo fazer essa troca. Ate amanha!', tempo: 14 },
  { remetente: 'sofia', texto: 'Ate amanha! Vou confirmar o agendamento pelo aplicativo. 🌿', tempo: 15 }
];

let cont = { u: 0, i: 0, f: 0, s: 0, m: 0, n: 0, a: 0, av: 0 };

async function main() {
  const uid = crypto.randomUUID();
  
  // 1. Inserir usuário
  await new Promise(r => {
    db.run('INSERT INTO usuarios (id, criado_em, email, email_verificado, foto_url, itens_doados, kg_residuo_evitado, latitude, longitude, nome, perfil_ativo, pontos, raio_busca_km, reputacao_score, selo_atual, senha_hash, telefone, telefone_verificado, cpf, cep, numero, complemento, bairro, cidade, estado, status_online) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        uid, Math.floor(Date.now()/1000), usuarioEspecial.email, 1,
        'https://loremflickr.com/200/200/face,portrait/all?lock='+usuarioEspecial.lock,
        usuarioEspecial.itens, usuarioEspecial.kg, usuarioEspecial.lat, usuarioEspecial.lng,
        usuarioEspecial.nome, usuarioEspecial.perfil, usuarioEspecial.pontos, usuarioEspecial.raio,
        usuarioEspecial.reputacao, usuarioEspecial.selo, SENHA, usuarioEspecial.telefone, 1,
        usuarioEspecial.cpf, usuarioEspecial.cep, usuarioEspecial.numero, usuarioEspecial.complemento,
          [sid, agora(), conversaCompleta[0].texto, 'ACEITA', itemRealId, USUARIO_ALVO],
      ],
      (err) => {
        if (err) {
          console.error('❌ Erro:', err.message);
        } else {
          cont.u++;
              [crypto.randomUUID(), agora(), 0, 'CHAT', 'Sofia Albuquerque enviou uma mensagem sobre '+itemConversa.titulo, USUARIO_ALVO],
          console.log('   Email:', usuarioEspecial.email);
          console.log('   Senha:', SENHA);
          console.log('   CPF:', usuarioEspecial.cpf);
          console.log('   Status: Online');
        }
        r();
      });
  });

  // 2. Inserir itens
  for (let i = 0; i < itensEspeciais.length; i++) {
    const item = itensEspeciais[i];
                [crypto.randomUUID(), agora() + index * 30 * 1000, msg.texto, remetenteId, sid],
    
    await new Promise(r => {
      db.run('INSERT INTO itens (id, bairro, categoria, cidade, descricao, estado_conservacao, impacto_co2kg, latitude, longitude, publicado_em, qr_code_token, status, tipo_publicacao, titulo, uf, doador_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [iid, item.bairro, item.categoria, 'Belo Horizonte', item.descricao, item.conservacao, item.co2, usuarioEspecial.lat+(i*0.001), usuarioEspecial.lng-(i*0.001), Math.floor(Date.now()/1000)+i, '', 'ATIVO', 'TROCAR', item.titulo, 'MG', uid],
        () => {
          cont.i++;
          console.log('  📦 Item:', item.titulo);
          const foto = 'https://loremflickr.com/800/600/'+item.keyword+'/all?lock='+(900+i);
          db.run('INSERT INTO item_fotos_urls (item_id, foto_url) VALUES (?,?)', [iid, foto], () => {
            cont.f++;
            console.log('    📸 Foto:', foto);
            r();
          });
        });
                        [aid, agora(), agora()+60*1000, agora()+86400*1000, 0, 0, 'Praca da Liberdade - Entrada Principal', 'CONCLUIDO', sid],
  }

  // 3. Criar conversa completa
  console.log('\n📊 Criando conversa detalhada...\n');
  
  const itemConversa = itensEspeciais[0]; // Kit de Jardinagem
                            [crypto.randomUUID(), 'Sofia e uma pessoa incrivel! A troca foi perfeita e o kit de jardinagem estava impecavel! Super recomendo!', agora()+100*1000, 5, aid, uid, USUARIO_ALVO],
  
  await new Promise(r => {
    // Buscar o ID do item de jardinagem
    db.get('SELECT id FROM itens WHERE titulo = ? AND doador_id = ?', [itemConversa.titulo, uid], (err, row) => {
      if (err || !row) {
        console.error('❌ Item não encontrado');
        r();
        return;
      }
      
      const itemRealId = row.id;
      
      // Criar solicitação ACEITA
      db.run('INSERT INTO solicitacoes (id, criada_em, mensagem, status, item_id, receptor_id) VALUES (?,?,?,?,?,?)',
        [sid, Math.floor(Date.now()/1000), conversaCompleta[0].texto, 'ACEITA', itemRealId, USUARIO_ALVO],
        () => {
          cont.s++;
          console.log('📝 Conversa criada: Sofia <-> Usuário Alvo');
          
          // Notificação para o usuário alvo
          db.run('INSERT INTO notificacoes (id, criada_em, lida, tipo, titulo, usuario_id) VALUES (?,?,?,?,?,?)',
            [crypto.randomUUID(), Math.floor(Date.now()/1000), 0, 'CHAT', 'Sofia Albuquerque enviou uma mensagem sobre '+itemConversa.titulo, USUARIO_ALVO],
            () => {
              cont.n++;
              console.log('  🔔 Notificação enviada');
            });
          
          // Inserir todas as mensagens da conversa
          let mensagensInseridas = 0;
          
          conversaCompleta.forEach((msg, index) => {
            const remetenteId = msg.remetente === 'sofia' ? uid : USUARIO_ALVO;
            
            db.run('INSERT INTO mensagens (id, criada_em, texto, remetente_id, solicitacao_id) VALUES (?,?,?,?,?)',
              [crypto.randomUUID(), Math.floor(Date.now()/1000) + index * 30, msg.texto, remetenteId, sid],
              (err) => {
                if (!err) {
                  mensagensInseridas++;
                  cont.m++;
                  
                  const prefixo = msg.remetente === 'sofia' ? '👩 Sofia' : '👤 Usuário Alvo';
                  console.log(`  ${prefixo}: ${msg.texto.substring(0, 60)}${msg.texto.length > 60 ? '...' : ''}`);
                  
                  // Quando terminar todas as mensagens
                  if (mensagensInseridas === conversaCompleta.length) {
                    // Criar agendamento
                    const aid = crypto.randomUUID();
                    
                    db.run('INSERT INTO agendamentos (id, confirmacao_doador_em, confirmacao_receptor_em, data_hora, lembrete1h_enviado, lembrete24h_enviado, local_encontro, status, solicitacao_id) VALUES (?,?,?,?,?,?,?,?,?)',
                      [aid, Math.floor(Date.now()/1000), Math.floor(Date.now()/1000)+60, Math.floor(Date.now()/1000)+86400, 0, 0, 'Praca da Liberdade - Entrada Principal', 'CONCLUIDO', sid],
                      () => {
                        cont.a++;
                        console.log('\n  📅 Agendamento criado: Praca da Liberdade');
                        
                        // Criar avaliação
                        db.run('INSERT INTO avaliacoes (id, comentario, criada_em, nota, agendamento_id, avaliado_id, avaliador_id) VALUES (?,?,?,?,?,?,?)',
                          [crypto.randomUUID(), 'Sofia e uma pessoa incrivel! A troca foi perfeita e o kit de jardinagem estava impecavel. Super recomendo!', Math.floor(Date.now()/1000)+100, 5, aid, uid, USUARIO_ALVO],
                          () => {
                            cont.av++;
                            console.log('  ⭐ Avaliação: 5 estrelas');
                            r();
                          });
                      });
                  }
                }
              });
          });
        });
    });
  });

  // Resumo
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 USUÁRIO ESPECIAL CRIADO COM SUCESSO!');
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
    
    console.log('\n📋 LOGIN DO NOVO USUÁRIO:');
    console.log('='.repeat(60));
    console.log('Nome: Sofia Albuquerque');
    console.log('Email: sofia.albuquerque@reviva.com');
    console.log('Senha: UserTeste123');
    console.log('CPF: 678.901.234-56');
    console.log('Status: Online');
    console.log('='.repeat(60));
    console.log('\n💬 CONVERSA COM USUÁRIO ALVO:');
    console.log('='.repeat(60));
    console.log('15 mensagens trocadas');
    console.log('1 agendamento na Praça da Liberdade');
    console.log('1 avaliação de 5 estrelas');
    console.log('1 notificação enviada');
    console.log('='.repeat(60));
    
    db.close();
  }, 2000);
}

main().catch(err => {
  console.error('❌ Erro:', err);
  db.close();
});
