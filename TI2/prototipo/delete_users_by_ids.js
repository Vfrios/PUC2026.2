const { MongoClient, ObjectId } = require('mongodb');

const TARGET_IDS = [
  '6aa2ea727a343640f4175d51',
  '6aa2ea9db0de1f0f9d882fc9',
  '6aa2f242a9a0831c4d0fa190',
  '6aa2fb036f6cc042e7ef94b8',
  '6aadd865ef17780b870750b5',
  '6aae8e0d8e44b04bbce5ff9a',
];

const TARGET_OBJECT_IDS = TARGET_IDS.map((id) => new ObjectId(id));

const args = new Set(process.argv.slice(2));
const confirmDelete = args.has('--confirm');
const dryRun = args.has('--dry-run') || !confirmDelete;

function printBanner(action) {
  console.log('\n=== ' + action + ' ===');
}

async function withDb(callback) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não encontrada. Use o arquivo atlas-credentials.env ou exporte a variável antes de executar.');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE || 'reviva');
    await callback(db);
  } finally {
    await client.close();
  }
}

async function countMatches(db, collectionName, filter) {
  const total = await db.collection(collectionName).countDocuments(filter);
  return total;
}

async function deleteCollection(db, collectionName, filter, label) {
  const count = await countMatches(db, collectionName, filter);
  if (count === 0) {
    console.log(`- ${label}: 0 documentos`);
    return 0;
  }

  if (dryRun) {
    console.log(`- ${label}: ${count} documento(s) seriam removidos`);
    return count;
  }

  const result = await db.collection(collectionName).deleteMany(filter);
  console.log(`- ${label}: ${result.deletedCount} documento(s) removidos`);
  return result.deletedCount;
}

async function main() {
  const targetIds = [...new Set(TARGET_IDS)];

  printBanner('Verificação de dados relacionados');
  console.log('IDs-alvo:', targetIds.join(', '));
  console.log('Modo:', dryRun ? 'preview (sem deletar)' : 'delete real');

  if (!confirmDelete && dryRun) {
    console.log('Use --confirm para executar a remoção real.');
  }

  await withDb(async (db) => {
    const usuariosMatch = { _id: { $in: TARGET_OBJECT_IDS } };
    const usuarioCount = await countMatches(db, 'usuarios', usuariosMatch);
    console.log(`- usuarios: ${usuarioCount} documento(s) encontrados`);

    if (usuarioCount === 0) {
      console.log('\nNenhum usuário com esses IDs foi encontrado no MongoDB.');
      return;
    }

    const itemIdsToRemove = await db.collection('itens')
      .find({ 'doador.$id': { $in: TARGET_OBJECT_IDS } }, { projection: { _id: 1 } })
      .toArray();

    const itemIds = itemIdsToRemove.map((i) => i._id);

    const solicitacoesMatch = {
      $or: [
        { 'item.doador.$id': { $in: TARGET_OBJECT_IDS } },
        { 'receptor.$id': { $in: TARGET_OBJECT_IDS } },
        { 'item.$id': { $in: itemIds } },
      ],
    };

    const solicitacoes = await db.collection('solicitacoes').find(solicitacoesMatch, { projection: { _id: 1 } }).toArray();
    const solicitacaoIds = solicitacoes.map((s) => s._id);

    printBanner('Contagem de documentos relacionados');
    const related = {
      mensagens: { collection: 'mensagens', filter: { $or: [{ 'remetente.$id': { $in: TARGET_OBJECT_IDS } }, { 'solicitacao.$id': { $in: solicitacaoIds } }] }, label: 'mensagens' },
      agendamentos: { collection: 'agendamentos', filter: { 'solicitacao.$id': { $in: solicitacaoIds } }, label: 'agendamentos' },
      solicitacoes: { collection: 'solicitacoes', filter: solicitacoesMatch, label: 'solicitacoes' },
      itens: { collection: 'itens', filter: { 'doador.$id': { $in: TARGET_OBJECT_IDS } }, label: 'itens' },
      avaliacoes: { collection: 'avaliacoes', filter: { $or: [{ 'avaliador.$id': { $in: TARGET_OBJECT_IDS } }, { 'avaliado.$id': { $in: TARGET_OBJECT_IDS } }] }, label: 'avaliacoes' },
      notificacoes: { collection: 'notificacoes', filter: { 'usuario.$id': { $in: TARGET_OBJECT_IDS } }, label: 'notificacoes' },
      denuncias: { collection: 'denuncias', filter: { $or: [{ 'denunciante.$id': { $in: TARGET_OBJECT_IDS } }, { 'denunciado.$id': { $in: TARGET_OBJECT_IDS } }] }, label: 'denuncias' },
      comunidades: { collection: 'comunidades', filter: { 'membros.$id': { $in: TARGET_OBJECT_IDS } }, label: 'comunidades' },
      usuarios: { collection: 'usuarios', filter: usuariosMatch, label: 'usuarios' },
    };

    for (const entry of Object.values(related)) {
      await deleteCollection(db, entry.collection, entry.filter, entry.label);
    }

    if (!confirmDelete && dryRun) {
      console.log('\nPreview concluída. Nenhum dado foi removido.');
      console.log('Para apagar de fato, execute: node --env-file=atlas-credentials.env delete_users_by_ids.js --confirm');
      return;
    }

    if (!confirmDelete) {
      console.log('\nNenhuma ação executada. Passe --confirm para confirmar a remoção.');
      return;
    }

    console.log('\nRemoção concluída para os IDs informados.');
  });
}

main().catch((error) => {
  console.error('\nErro ao processar exclusão:', error.message);
  process.exit(1);
});
