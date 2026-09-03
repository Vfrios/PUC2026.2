const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('reviva-api/db/reviva.db');
db.configure('busyTimeout', 15000);
db.run('PRAGMA journal_mode = WAL');

db.run('PRAGMA foreign_keys = OFF;');

const tabelas = [
  'avaliacoes',
  'agendamentos',
  'mensagens',
  'notificacoes',
  'solicitacoes',
  'item_fotos_urls',
  'itens',
  'comunidade_membros',
  'comunidades',
  'usuarios'
];

console.log('🗑️ LIMPANDO BANCO DE DADOS...\n');

let limpas = 0;

tabelas.forEach((tabela, index) => {
  db.run('DELETE FROM ' + tabela, (err) => {
    if (!err) {
      limpas++;
      console.log('✅', tabela, '- LIMPA');
    } else {
      console.log('⚠️', tabela, '-', err.message);
    }
    
    db.run("DELETE FROM sqlite_sequence WHERE name = '" + tabela + "'", () => {});
    
    if (index === tabelas.length - 1) {
      db.run('PRAGMA foreign_keys = ON;');
      console.log('\n🎉 BANCO LIMPO COM SUCESSO!');
      console.log('📊 Tabelas limpas:', limpas);
      
      db.get('SELECT COUNT(*) as total FROM usuarios', (err, row) => {
        console.log('👥 Usuários restantes:', row.total);
        db.close();
      });
    }
  });
});
