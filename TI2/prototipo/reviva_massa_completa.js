const { MongoClient, DBRef } = require("mongodb");
const crypto = require("crypto");

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || "reviva";
const senhaHash = process.env.REVIVA_SEED_PASSWORD_HASH || "$2a$10$coTOIiAp3zuep4u9z8lGJ.amF.bzyE5XK4BQ/VIi.kB.wtHS7x57W";

if (!uri) throw new Error("Defina MONGODB_URI antes de executar a carga.");

const bairros = [
  ["Barreiro", "30640000", -19.9665, -44.0395], ["Nova Suica", "30430000", -19.9335, -43.9655],
  ["Carlos Prates", "30710000", -19.9085, -43.9485], ["Calafate", "30440000", -19.9375, -43.9605],
  ["Floresta", "30150000", -19.9175, -43.9205], ["Horto", "31050000", -19.8985, -43.8895],
  ["Ipiranga", "31160000", -19.9055, -43.9685], ["Grajau", "30480000", -19.9475, -43.9545],
  ["Gutierrez", "30430010", -19.9415, -43.9595], ["Santa Efigenia", "30230000", -19.9155, -43.9285],
  ["Serra", "30220000", -19.9295, -43.9355], ["Sao Pedro", "30330000", -19.9455, -43.9465],
  ["Sao Lucas", "30310000", -19.9555, -43.9485], ["Belvedere", "30320000", -19.9635, -43.9535],
  ["Vila da Serra", "34000000", -19.9875, -43.8435],
];
const nomes = [
  "Alan Ferreira", "Beatriz Nunes", "Carlos Eduardo", "Daniela Souza", "Eduardo Lima", "Fernanda Rocha",
  "Gabriel Santos", "Helena Martins", "Igor Pereira", "Juliana Costa", "Kaique Almeida", "Larissa Freitas",
  "Marcos Vinicius", "Natalia Oliveira", "Otavio Augusto", "Patricia Gomes", "Rafael Mendes", "Sabrina Castro",
  "Thiago Araujo", "Ursula Dias", "Vagner Lopes", "Wanessa Silva", "Xavier Santos", "Yara Oliveira",
  "Zelia Martins", "Anderson Costa", "Bianca Alves", "Cristiano Rocha", "Daniel Oliveira", "Elisa Rodrigues",
];
const itensBase = [
  ["Fogao 4 Bocas", "COZINHA", "Fogao com forno e quatro queimadores.", 6, 25], ["Mesa de Plastico", "MOVEIS", "Mesa para area externa.", 2, 3],
  ["Cadeira de Jantar", "MOVEIS", "Cadeira de madeira em bom estado.", 3.5, 8], ["Jogo de Copos", "COZINHA", "Conjunto de copos de vidro.", 0.8, 1.2],
  ["Radio Antigo", "OUTROS", "Radio funcionando perfeitamente.", 1.5, 2], ["Porta-chaves", "OUTROS", "Porta-chaves de parede.", 0.5, 0.3],
  ["Batedeira", "COZINHA", "Batedeira eletrica com tres velocidades.", 2, 2.5], ["Tapete", "OUTROS", "Tapete para sala.", 1.8, 3],
  ["Cama Solteiro", "MOVEIS", "Cama de solteiro com cabeceira.", 3, 12], ["Guarda-roupa", "MOVEIS", "Guarda-roupa pequeno de madeira.", 5, 18],
  ["Liquidificador", "ELETRONICOS", "Liquidificador com copo de vidro.", 1.5, 2], ["Conjunto de Panelas", "COZINHA", "Conjunto de panelas de aluminio.", 4, 5],
  ["Mesa de Centro", "MOVEIS", "Mesa de centro em MDF.", 3, 6], ["Abajur", "MOVEIS", "Abajur com base de metal.", 1, 1.5],
  ["Cafeteira", "ELETRONICOS", "Cafeteira eletrica com filtro.", 1.5, 2], ["Jogo de Xicaras", "COZINHA", "Conjunto de xicaras de porcelana.", 0.8, 0.5],
  ["Televisao 42", "ELETRONICOS", "TV LED de 42 polegadas.", 4, 10], ["Suporte de Parede", "MOVEIS", "Suporte articulado para TV.", 1.5, 2],
  ["Fritadeira", "COZINHA", "Fritadeira eletrica sem oleo.", 2, 3], ["Balanca Digital", "OUTROS", "Balanca digital de cozinha.", 0.5, 0.5],
];
function id(seed) { return crypto.createHash("sha256").update(`reviva-seed:${seed}`).digest("hex").slice(0, 24); }
function ref(collection, value) { return new DBRef(collection, value); }
function dataUrl(seed) { return `https://loremflickr.com/900/650/object/all?lock=${seed}`; }

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(databaseName);
  const usuarios = db.collection("usuarios");
  const itens = db.collection("itens");
  const comunidades = db.collection("comunidades");
  const solicitacoes = db.collection("solicitacoes");
  const agendamentos = db.collection("agendamentos");
  const avaliacoes = db.collection("avaliacoes");
  const agora = new Date();
  const usuariosSeed = [];
  const itensSeed = [];

  for (let index = 0; index < nomes.length; index++) {
    const [bairro, cep, latitude, longitude] = bairros[index % bairros.length];
    const deterministicUserId = id(`usuario-${index + 1}`);
    const email = `${nomes[index].toLowerCase().replace(/[^a-z]+/g, ".")}@reviva.com`;
    const existente = await usuarios.findOne({ email }, { projection: { _id: 1 } });
    const userId = existente?._id || deterministicUserId;
    const usuario = {
      _id: userId, nome: nomes[index], email, cpf: String(10000000000 + index + 1), senhaHash,
      telefone: `(31) 98811-${String(5001 + index).padStart(4, "0")}`,
      fotoUrl: `https://i.pravatar.cc/256?img=${(index % 70) + 1}`, cep, numero: String(100 + index * 10),
      complemento: index % 2 ? "Casa" : `Apto ${index + 1}`, latitude, longitude, raioBuscaKm: 10 + (index % 11),
      emailVerificado: true, telefoneVerificado: true, reputacaoScore: 4.5, itensDoados: 0,
      kgResiduoEvitado: 0, pontos: 50 + index * 10, seloAtual: index >= 25 ? "OURO" : index >= 10 ? "PRATA" : "BRONZE",
      criadoEm: new Date(agora.getTime() - (index + 1) * 86400000),
    };
    await usuarios.updateOne({ email }, { $setOnInsert: usuario }, { upsert: true });
    usuariosSeed.push(usuario);

    for (let itemIndex = 0; itemIndex < 2; itemIndex++) {
      const base = itensBase[(index * 2 + itemIndex) % itensBase.length];
      const item = {
        _id: id(`item-${index + 1}-${itemIndex + 1}`), doador: ref("usuarios", userId),
        titulo: `${base[0]} ${index + 1}`, descricao: base[2], categoria: base[1],
        estadoConservacao: itemIndex ? "USADO" : "SEMINOVO", tipoPublicacao: (index + itemIndex) % 2 ? "DOAR" : "TROCAR",
        status: "ATIVO", latitude: latitude + itemIndex * 0.001, longitude: longitude - itemIndex * 0.001,
        cep, numero: usuario.numero, complemento: usuario.complemento, bairro,
        cidade: bairro === "Vila da Serra" ? "Nova Lima" : "Belo Horizonte", uf: "MG",
        impactoCo2Kg: base[3], pesoKg: base[4], fotosUrls: [dataUrl(5000 + index * 2 + itemIndex)],
        qrCodeToken: null, publicadoEm: new Date(agora.getTime() - (index + itemIndex + 1) * 3600000),
        expiraEm: new Date(agora.getTime() + 60 * 86400000),
      };
      await itens.updateOne({ _id: item._id }, { $setOnInsert: item }, { upsert: true });
      itensSeed.push(item);
    }
  }

  for (let index = 0; index < 2; index++) {
    const comunidadeId = id(`comunidade-${index + 1}`);
    await comunidades.updateOne({ _id: comunidadeId }, { $setOnInsert: {
      _id: comunidadeId, nome: index ? "ONG Reviver" : "BH Solidaria",
      descricao: index ? "Mutiroes locais de doacao." : "Rede de doacao e troca entre vizinhos.",
      bairroReferencia: index ? "Funcionarios" : "Regiao Centro-Sul",
      membros: usuariosSeed.slice(index * 10, index * 10 + 10).map(usuario => ref("usuarios", usuario._id)),
    } }, { upsert: true });
  }

  for (let index = 0; index < usuariosSeed.length; index++) {
    const avaliador = usuariosSeed[index];
    const avaliado = usuariosSeed[(index + 1) % usuariosSeed.length];
    const item = itensSeed[index * 2];
    const solicitacaoId = id(`solicitacao-seed-${index + 1}`);
    const agendamentoId = id(`agendamento-seed-${index + 1}`);
    const momento = new Date(agora.getTime() - (index + 1) * 86400000);
    await solicitacoes.updateOne({ _id: solicitacaoId }, { $setOnInsert: {
      _id: solicitacaoId, item: ref("itens", item._id), receptor: ref("usuarios", avaliador._id),
      mensagem: "Carga de avaliacao de teste", status: "ACEITA", criadaEm: momento,
    } }, { upsert: true });
    await agendamentos.updateOne({ _id: agendamentoId }, { $setOnInsert: {
      _id: agendamentoId, solicitacao: ref("solicitacoes", solicitacaoId), dataHora: momento,
      localEncontro: `Carga de avaliacao ${index + 1}`, status: "CONCLUIDO", lembrete24hEnviado: false,
      lembrete1hEnviado: false, confirmacaoDoadorEm: momento, confirmacaoReceptorEm: momento,
      confirmacaoAgendamentoReceptorEm: momento,
    } }, { upsert: true });
    await avaliacoes.updateOne({ _id: id(`avaliacao-seed-${index + 1}`) }, { $setOnInsert: {
      _id: id(`avaliacao-seed-${index + 1}`), agendamento: ref("agendamentos", agendamentoId),
      avaliador: ref("usuarios", avaliador._id), avaliado: ref("usuarios", avaliado._id), nota: 4 + (index % 2),
      comentario: "Experiencia excelente.", criadaEm: momento,
    } }, { upsert: true });
  }

  console.log(`Carga MongoDB concluida: ${usuariosSeed.length} usuarios, ${itensSeed.length} itens, 2 comunidades e ${usuariosSeed.length} avaliacoes idempotentes.`);
  await client.close();
}

main().catch(error => { console.error("Erro na carga MongoDB:", error.message); process.exitCode = 1; });
