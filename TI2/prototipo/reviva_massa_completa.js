const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'reviva-api', 'db', 'reviva.db');
const db = new sqlite3.Database(dbPath);
db.configure('busyTimeout', 15000);

const SENHA = 'UserTeste123';
const SENHA_HASH = '$2a$10$coTOIiAp3zuep4u9z8lGJ.amF.bzyE5XK4BQ/VIi.kB.wtHS7x57W';
const agora = Date.now();
const expiraEm = agora + 60 * 24 * 60 * 60 * 1000;

const usuarios = [
  // Barreiro
  { nome: 'Alan Ferreira', email: 'alan.ferreira@reviva.com', cpf: '11144477722', telefone: '(31) 98811-5001', cep: '30640000', numero: '110', complemento: 'Apto 201', bairro: 'Barreiro', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9665, lng: -44.0395, raio: 12, foto: 5001 },
  { nome: 'Beatriz Nunes', email: 'beatriz.nunes@reviva.com', cpf: '22255588833', telefone: '(31) 98811-5002', cep: '30640010', numero: '220', complemento: 'Casa 5', bairro: 'Barreiro', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9675, lng: -44.0385, raio: 15, foto: 5002 },
  
  // Nova Suíça
  { nome: 'Carlos Eduardo', email: 'carlos.eduardo@reviva.com', cpf: '33366699944', telefone: '(31) 98811-5003', cep: '30430000', numero: '330', complemento: 'Apto 302', bairro: 'Nova Suíça', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9335, lng: -43.9655, raio: 10, foto: 5003 },
  { nome: 'Daniela Souza', email: 'daniela.souza@reviva.com', cpf: '44477711155', telefone: '(31) 98811-5004', cep: '30430010', numero: '440', complemento: 'Casa 8', bairro: 'Nova Suíça', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9345, lng: -43.9645, raio: 14, foto: 5004 },
  
  // Carlos Prates
  { nome: 'Eduardo Lima', email: 'eduardo.lima@reviva.com', cpf: '55588822266', telefone: '(31) 98811-5005', cep: '30710000', numero: '550', complemento: 'Apto 403', bairro: 'Carlos Prates', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9085, lng: -43.9485, raio: 10, foto: 5005 },
  { nome: 'Fernanda Rocha', email: 'fernanda.rocha@reviva.com', cpf: '66699933377', telefone: '(31) 98811-5006', cep: '30710010', numero: '660', complemento: 'Casa 12', bairro: 'Carlos Prates', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9095, lng: -43.9475, raio: 16, foto: 5006 },
  
  // Calafate
  { nome: 'Gabriel Santos', email: 'gabriel.santos@reviva.com', cpf: '77711144488', telefone: '(31) 98811-5007', cep: '30440000', numero: '770', complemento: 'Apto 504', bairro: 'Calafate', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9375, lng: -43.9605, raio: 12, foto: 5007 },
  { nome: 'Helena Martins', email: 'helena.martins@reviva.com', cpf: '88822255599', telefone: '(31) 98811-5008', cep: '30440010', numero: '880', complemento: 'Casa 15', bairro: 'Calafate', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9385, lng: -43.9595, raio: 18, foto: 5008 },
  
  // Floresta
  { nome: 'Igor Pereira', email: 'igor.pereira@reviva.com', cpf: '99933366600', telefone: '(31) 98811-5009', cep: '30150000', numero: '990', complemento: 'Apto 605', bairro: 'Floresta', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9175, lng: -43.9205, raio: 10, foto: 5009 },
  { nome: 'Juliana Costa', email: 'juliana.costa@reviva.com', cpf: '11155599922', telefone: '(31) 98811-5010', cep: '30150010', numero: '1010', complemento: 'Casa 20', bairro: 'Floresta', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9185, lng: -43.9195, raio: 14, foto: 5010 },
  
  // Horto
  { nome: 'Kaique Almeida', email: 'kaique.almeida@reviva.com', cpf: '22266600033', telefone: '(31) 98811-5011', cep: '31050000', numero: '1120', complemento: 'Apto 706', bairro: 'Horto', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.8985, lng: -43.8895, raio: 12, foto: 5011 },
  { nome: 'Larissa Freitas', email: 'larissa.freitas@reviva.com', cpf: '33377711144', telefone: '(31) 98811-5012', cep: '31050010', numero: '1230', complemento: 'Casa 25', bairro: 'Horto', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.8995, lng: -43.8885, raio: 18, foto: 5012 },
  
  // Ipiranga
  { nome: 'Marcos Vinícius', email: 'marcos.vinicius@reviva.com', cpf: '44488822255', telefone: '(31) 98811-5013', cep: '31160000', numero: '1340', complemento: 'Apto 807', bairro: 'Ipiranga', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9055, lng: -43.9685, raio: 10, foto: 5013 },
  { nome: 'Natália Oliveira', email: 'natalia.oliveira@reviva.com', cpf: '55599933366', telefone: '(31) 98811-5014', cep: '31160010', numero: '1450', complemento: 'Casa 30', bairro: 'Ipiranga', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9065, lng: -43.9675, raio: 16, foto: 5014 },
  
  // Grajaú
  { nome: 'Otávio Augusto', email: 'otavio.augusto@reviva.com', cpf: '66611144477', telefone: '(31) 98811-5015', cep: '30480000', numero: '1560', complemento: 'Apto 908', bairro: 'Grajaú', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9475, lng: -43.9545, raio: 12, foto: 5015 },
  { nome: 'Patrícia Gomes', email: 'patricia.gomes@reviva.com', cpf: '77722255588', telefone: '(31) 98811-5016', cep: '30480010', numero: '1670', complemento: 'Casa 35', bairro: 'Grajaú', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9485, lng: -43.9535, raio: 20, foto: 5016 },
  
  // Gutierrez
  { nome: 'Rafael Mendes', email: 'rafael.mendes@reviva.com', cpf: '88833366699', telefone: '(31) 98811-5017', cep: '30430000', numero: '1780', complemento: 'Apto 1009', bairro: 'Gutierrez', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9415, lng: -43.9595, raio: 10, foto: 5017 },
  { nome: 'Sabrina Castro', email: 'sabrina.castro@reviva.com', cpf: '99944477700', telefone: '(31) 98811-5018', cep: '30430010', numero: '1890', complemento: 'Casa 40', bairro: 'Gutierrez', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9425, lng: -43.9585, raio: 15, foto: 5018 },
  
  // Santa Efigênia
  { nome: 'Thiago Araújo', email: 'thiago.araujo@reviva.com', cpf: '11166622288', telefone: '(31) 98811-5019', cep: '30230000', numero: '1900', complemento: 'Apto 1110', bairro: 'Santa Efigênia', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9155, lng: -43.9285, raio: 12, foto: 5019 },
  { nome: 'Ursula Dias', email: 'ursula.dias@reviva.com', cpf: '22277733399', telefone: '(31) 98811-5020', cep: '30230010', numero: '2010', complemento: 'Casa 45', bairro: 'Santa Efigênia', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9165, lng: -43.9275, raio: 18, foto: 5020 },
  
  // Serra
  { nome: 'Vagner Lopes', email: 'vagner.lopes@reviva.com', cpf: '33388844400', telefone: '(31) 98811-5021', cep: '30220000', numero: '2120', complemento: 'Apto 1211', bairro: 'Serra', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9295, lng: -43.9355, raio: 10, foto: 5021 },
  { nome: 'Wanessa Silva', email: 'wanessa.silva@reviva.com', cpf: '44499955511', telefone: '(31) 98811-5022', cep: '30220010', numero: '2230', complemento: 'Casa 50', bairro: 'Serra', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9305, lng: -43.9345, raio: 14, foto: 5022 },
  
  // São Pedro
  { nome: 'Xavier Santos', email: 'xavier.santos@reviva.com', cpf: '55511166622', telefone: '(31) 98811-5023', cep: '30330000', numero: '2340', complemento: 'Apto 1312', bairro: 'São Pedro', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9455, lng: -43.9465, raio: 12, foto: 5023 },
  { nome: 'Yara Oliveira', email: 'yara.oliveira@reviva.com', cpf: '66622277733', telefone: '(31) 98811-5024', cep: '30330010', numero: '2450', complemento: 'Casa 55', bairro: 'São Pedro', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9465, lng: -43.9455, raio: 16, foto: 5024 },
  
  // São Lucas
  { nome: 'Zélia Martins', email: 'zelia.martins@reviva.com', cpf: '77733388844', telefone: '(31) 98811-5025', cep: '30310000', numero: '2560', complemento: 'Apto 1413', bairro: 'São Lucas', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9555, lng: -43.9485, raio: 10, foto: 5025 },
  { nome: 'Anderson Costa', email: 'anderson.costa@reviva.com', cpf: '88844499955', telefone: '(31) 98811-5026', cep: '30310010', numero: '2670', complemento: 'Casa 60', bairro: 'São Lucas', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9565, lng: -43.9475, raio: 15, foto: 5026 },
  
  // Belvedere
  { nome: 'Bianca Alves', email: 'bianca.alves@reviva.com', cpf: '99955511166', telefone: '(31) 98811-5027', cep: '30320000', numero: '2780', complemento: 'Apto 1514', bairro: 'Belvedere', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9635, lng: -43.9535, raio: 12, foto: 5027 },
  { nome: 'Cristiano Rocha', email: 'cristiano.rocha@reviva.com', cpf: '11166622277', telefone: '(31) 98811-5028', cep: '30320010', numero: '2890', complemento: 'Casa 65', bairro: 'Belvedere', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9645, lng: -43.9525, raio: 18, foto: 5028 },
  
  // Nova Lima (Grande BH)
  { nome: 'Daniel Oliveira', email: 'daniel.oliveira@reviva.com', cpf: '22277733388', telefone: '(31) 98811-5029', cep: '34000000', numero: '2900', complemento: 'Apto 1615', bairro: 'Vila da Serra', cidade: 'Nova Lima', uf: 'MG', lat: -19.9875, lng: -43.8435, raio: 20, foto: 5029 },
  { nome: 'Elisa Rodrigues', email: 'elisa.rodrigues@reviva.com', cpf: '33388844499', telefone: '(31) 98811-5030', cep: '34000010', numero: '3010', complemento: 'Casa 70', bairro: 'Vila da Serra', cidade: 'Nova Lima', uf: 'MG', lat: -19.9885, lng: -43.8425, raio: 25, foto: 5030 }
];

const anuncios = [
  // Alan Ferreira - Barreiro
  [['Fogão 4 Bocas', 'COZINHA', 'Fogão com forno e 4 queimadores.', 'SEMINOVO', 6.0, 25, 'stove,kitchen'], ['Mesa de Plástico', 'MOVEIS', 'Mesa de plástico para área externa.', 'USADO', 2.0, 3, 'plastic,table']],
  
  // Beatriz Nunes - Barreiro
  [['Cadeira de Jantar', 'MOVEIS', 'Conjunto de 4 cadeiras de madeira.', 'SEMINOVO', 3.5, 8, 'chair,wood'], ['Jogo de Copos', 'COZINHA', 'Conjunto de copos de vidro.', 'NOVO', 0.8, 1.2, 'glasses,drink']],
  
  // Carlos Eduardo - Nova Suíça
  [['Rádio Antigo', 'OUTROS', 'Rádio antigo funcionando perfeitamente.', 'SEMINOVO', 1.5, 2, 'radio,vintage'], ['Porta-chaves', 'OUTROS', 'Porta-chaves de parede.', 'NOVO', 0.5, 0.3, 'key,holder']],
  
  // Daniela Souza - Nova Suíça
  [['Batedeira', 'COZINHA', 'Batedeira elétrica com 3 velocidades.', 'SEMINOVO', 2.0, 2.5, 'mixer,kitchen'], ['Tapete', 'OUTROS', 'Tapete felpudo para sala.', 'USADO', 1.8, 3, 'carpet,home']],
  
  // Eduardo Lima - Carlos Prates
  [['Cama Solteiro', 'MOVEIS', 'Cama solteiro com cabeceira.', 'SEMINOVO', 3.0, 12, 'single,bed'], ['Guarda-roupa', 'MOVEIS', 'Guarda-roupa pequeno de madeira.', 'USADO', 5.0, 18, 'wardrobe,wood']],
  
  // Fernanda Rocha - Carlos Prates
  [['Liquidificador', 'ELETRONICOS', 'Liquidificador com copo de vidro.', 'SEMINOVO', 1.5, 2, 'blender,glass'], ['Conjunto de Panelas', 'COZINHA', 'Conjunto de panelas de alumínio.', 'USADO', 4.0, 5, 'pots,aluminum']],
  
  // Gabriel Santos - Calafate
  [['Mesa de Centro', 'MOVEIS', 'Mesa de centro em MDF.', 'SEMINOVO', 3.0, 6, 'center,table'], ['Abajur', 'MOVEIS', 'Abajur com base de metal.', 'SEMINOVO', 1.0, 1.5, 'lamp,metal']],
  
  // Helena Martins - Calafate
  [['Cafeteira', 'ELETRONICOS', 'Cafeteira elétrica com filtro.', 'SEMINOVO', 1.5, 2, 'coffee,maker'], ['Jogo de Xícaras', 'COZINHA', 'Conjunto de xícaras de porcelana.', 'NOVO', 0.8, 0.5, 'cups,porcelain']],
  
  // Igor Pereira - Floresta
  [['Televisão 42', 'ELETRONICOS', 'TV LED 42 polegadas Full HD.', 'SEMINOVO', 4.0, 10, 'television,fullhd'], ['Suporte de Parede', 'MOVEIS', 'Suporte articulado para TV.', 'SEMINOVO', 1.5, 2, 'tv,wall']],
  
  // Juliana Costa - Floresta
  [['Fritadeira', 'COZINHA', 'Fritadeira elétrica sem óleo.', 'SEMINOVO', 2.0, 3, 'air,fryer'], ['Balança Digital', 'OUTROS', 'Balança digital de cozinha.', 'NOVO', 0.5, 0.5, 'scale,digital']],
  
  // Kaique Almeida - Horto
  [['Mesa de Ferro', 'MOVEIS', 'Mesa de ferro para jardim.', 'SEMINOVO', 2.5, 5, 'iron,table'], ['Cadeira de Praia', 'OUTROS', 'Cadeira de praia dobrável.', 'SEMINOVO', 1.0, 1.8, 'beach,chair']],
  
  // Larissa Freitas - Horto
  [['Bicicleta Infantil', 'INFANTIL', 'Bicicleta infantil com rodinhas.', 'USADO', 1.0, 3, 'kids,bike'], ['Boneca', 'INFANTIL', 'Boneca de pano artesanal.', 'SEMINOVO', 0.5, 0.3, 'doll,cloth']],
  
  // Marcos Vinícius - Ipiranga
  [['Ventilador', 'ELETRONICOS', 'Ventilador de mesa com 3 velocidades.', 'SEMINOVO', 1.0, 2, 'fan,table'], ['Luminária', 'MOVEIS', 'Luminária de teto com vidro.', 'USADO', 0.8, 1.2, 'lamp,glass']],
  
  // Natália Oliveira - Ipiranga
  [['Jogo de Panelas', 'COZINHA', 'Conjunto de panelas antiaderentes.', 'SEMINOVO', 3.5, 6, 'pots,nonstick'], ['Prateleira', 'MOVEIS', 'Prateleira de madeira para parede.', 'SEMINOVO', 1.5, 2.5, 'shelf,wood']],
  
  // Otávio Augusto - Grajaú
  [['Cama de Casal', 'MOVEIS', 'Cama de casal com colchão.', 'SEMINOVO', 5.0, 25, 'double,bed'], ['Espelho', 'MOVEIS', 'Espelho grande de parede.', 'SEMINOVO', 2.0, 4, 'mirror,wall']],
  
  // Patrícia Gomes - Grajaú
  [['Home Theater', 'ELETRONICOS', 'Home theater completo com 5 canais.', 'SEMINOVO', 4.5, 12, 'home,theater'], ['Estante', 'MOVEIS', 'Estante de madeira com 3 prateleiras.', 'USADO', 3.0, 8, 'shelf,wood']],
  
  // Rafael Mendes - Gutierrez
  [['Geladeira Pequena', 'ELETRONICOS', 'Geladeira compacta para quarto.', 'SEMINOVO', 3.0, 15, 'mini,refrigerator'], ['Micro-ondas', 'ELETRONICOS', 'Micro-ondas com 20 litros.', 'SEMINOVO', 2.5, 5, 'microwave,kitchen']],
  
  // Sabrina Castro - Gutierrez
  [['Máquina de Costura', 'OUTROS', 'Máquina de costura portátil.', 'SEMINOVO', 2.0, 4, 'sewing,machine'], ['Kit de Bijuterias', 'ROUPAS', 'Conjunto de bijuterias artesanais.', 'NOVO', 0.8, 0.5, 'jewelry,craft']],
  
  // Thiago Araújo - Santa Efigênia
  [['Cadeira Gamer', 'MOVEIS', 'Cadeira gamer com ajuste de altura.', 'SEMINOVO', 3.5, 8, 'gaming,chair'], ['Mesa para PC', 'MOVEIS', 'Mesa para computador com teclado.', 'SEMINOVO', 2.5, 6, 'desk,computer']],
  
  // Ursula Dias - Santa Efigênia
  [['Impressora', 'ELETRONICOS', 'Impressora jato de tinta colorida.', 'SEMINOVO', 2.0, 4, 'printer,inkjet'], ['Monitor', 'ELETRONICOS', 'Monitor LED 21 polegadas.', 'SEMINOVO', 2.0, 3, 'monitor,led']],
  
  // Vagner Lopes - Serra
  [['Sofá', 'MOVEIS', 'Sofá de 3 lugares em tecido.', 'SEMINOVO', 5.0, 30, 'sofa,fabric'], ['Poltrona', 'MOVEIS', 'Poltrona reclinável.', 'SEMINOVO', 3.0, 10, 'recliner,chair']],
  
  // Wanessa Silva - Serra
  [['Jogo de Pratos', 'COZINHA', 'Conjunto de pratos para 6 pessoas.', 'SEMINOVO', 2.0, 3, 'plates,porcelain'], ['Talheres', 'COZINHA', 'Jogo de talheres para 6 pessoas.', 'NOVO', 0.5, 0.8, 'cutlery,set']],
  
  // Xavier Santos - São Pedro
  [['Armário', 'MOVEIS', 'Armário de cozinha com prateleiras.', 'SEMINOVO', 4.0, 15, 'cabinet,kitchen'], ['Mesa', 'MOVEIS', 'Mesa de jantar para 6 pessoas.', 'SEMINOVO', 4.5, 20, 'dining,table']],
  
  // Yara Oliveira - São Pedro
  [['Fogão', 'COZINHA', 'Fogão 5 bocas com forno.', 'SEMINOVO', 5.0, 22, 'stove,gas'], ['Exaustor', 'ELETRONICOS', 'Exaustor para cozinha.', 'SEMINOVO', 2.5, 4, 'range,hood']],
  
  // Zélia Martins - São Lucas
  [['Cama', 'MOVEIS', 'Cama box queen com colchão.', 'SEMINOVO', 6.0, 35, 'queen,bed'], ['Cabeceira', 'MOVEIS', 'Cabeceira de madeira para cama.', 'SEMINOVO', 1.5, 3, 'headboard,wood']],
  
  // Anderson Costa - São Lucas
  [['TV 32', 'ELETRONICOS', 'TV LED 32 polegadas HD.', 'SEMINOVO', 3.0, 6, 'television,hd'], ['Suporte', 'MOVEIS', 'Suporte para TV com prateleira.', 'SEMINOVO', 1.5, 2, 'tv,stand']],
  
  // Bianca Alves - Belvedere
  [['Mesa de Centro', 'MOVEIS', 'Mesa de centro em vidro temperado.', 'SEMINOVO', 2.5, 5, 'glass,table'], ['Tapete Persa', 'OUTROS', 'Tapete persa de alta qualidade.', 'USADO', 3.0, 4, 'persian,carpet']],
  
  // Cristiano Rocha - Belvedere
  [['Cafeteira Expresso', 'ELETRONICOS', 'Cafeteira expresso com vaporizador.', 'SEMINOVO', 2.5, 4, 'espresso,machine'], ['Kit de Chá', 'COZINHA', 'Conjunto de xícaras e bule.', 'NOVO', 1.0, 0.8, 'tea,set']],
  
  // Daniel Oliveira - Vila da Serra (Nova Lima)
  [['Mesa de Escritório', 'MOVEIS', 'Mesa para escritório com gavetas.', 'SEMINOVO', 3.5, 12, 'office,desk'], ['Cadeira Escritório', 'MOVEIS', 'Cadeira giratória com braços.', 'SEMINOVO', 2.5, 6, 'office,chair']],
  
  // Elisa Rodrigues - Vila da Serra (Nova Lima)
  [['Impressora Multifuncional', 'ELETRONICOS', 'Impressora com scanner e copiadora.', 'SEMINOVO', 2.5, 5, 'multifunction,printer'], ['Bicicleta', 'OUTROS', 'Bicicleta aro 26 para lazer.', 'SEMINOVO', 4.0, 12, 'bicycle,leisure']]
];

const run = (sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function (err) { err ? reject(err) : resolve(this); }));
const get = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));

async function criarAvaliacaoDeTeste(usuarioId, avaliadoId, itemId, nota, comentario, indice) {
  const chave = `Carga de avaliacao ${indice + 1}`;
  const existente = await get('SELECT id FROM agendamentos WHERE local_encontro = ?', [chave]);
  if (existente) return false;

  const solicitacaoId = crypto.randomUUID();
  const agendamentoId = crypto.randomUUID();
  const momento = agora - (indice + 1) * 24 * 60 * 60 * 1000;

  await run(`INSERT INTO solicitacoes (id, criada_em, mensagem, status, item_id, receptor_id)
    VALUES (?,?,?,?,?,?)`, [solicitacaoId, momento, 'Troca concluida para avaliacao de teste', 'ACEITA', itemId, avaliadoId]);
  await run(`INSERT INTO agendamentos
    (id, confirmacao_doador_em, confirmacao_receptor_em, data_hora,
     lembrete1h_enviado, lembrete24h_enviado, local_encontro, status, solicitacao_id)
    VALUES (?,?,?,?,?,?,?,?,?)`, [
    agendamentoId, momento, momento, momento, 0, 0, chave, 'CONCLUIDO', solicitacaoId
  ]);
  await run(`INSERT INTO avaliacoes
    (id, comentario, criada_em, nota, agendamento_id, avaliado_id, avaliador_id)
    VALUES (?,?,?,?,?,?,?)`, [
    crypto.randomUUID(), comentario, momento, nota, agendamentoId, avaliadoId, usuarioId
  ]);
  return true;
}

async function atualizarReputacaoESelos(idsUsuarios) {
  const pontosPorPerfil = [60, 75, 90, 110, 130, 150, 175, 220, 280, 360,
    55, 70, 85, 105, 125, 145, 180, 230, 290, 380,
    65, 80, 95, 115, 135, 155, 185, 240, 300, 400];
  for (let i = 0; i < idsUsuarios.length; i++) {
    const usuarioId = idsUsuarios[i];
    const resultado = await get('SELECT AVG(nota) AS media FROM avaliacoes WHERE avaliado_id = ?', [usuarioId]);
    const media = resultado?.media == null ? 0 : Math.round(Number(resultado.media) * 100) / 100;
    const pontos = pontosPorPerfil[i] || 50;
    const selo = pontos >= 350 ? 'ESMERALDA' : pontos >= 150 ? 'OURO' : pontos >= 50 ? 'PRATA' : 'BRONZE';
    await run('UPDATE usuarios SET reputacao_score = ?, pontos = ?, selo_atual = ? WHERE id = ?', [media, pontos, selo, usuarioId]);
  }
}

async function criarUsuario(usuario) {
  const existente = await get('SELECT id FROM usuarios WHERE email = ?', [usuario.email]);
  if (existente) return { id: existente.id, novo: false };
  const id = crypto.randomUUID();
  await run(`INSERT INTO usuarios (id, criado_em, email, email_verificado, foto_url,
    itens_doados, kg_residuo_evitado, latitude, longitude, nome, pontos, raio_busca_km,
    reputacao_score, selo_atual, senha_hash, telefone, telefone_verificado, cep,
    complemento, numero, cpf) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    id, agora, usuario.email, 1,
    `https://loremflickr.com/256/256/portrait,person/all?lock=${usuario.foto}`,
    0, 0, usuario.lat, usuario.lng, usuario.nome, 0, usuario.raio, 0, 'BRONZE',
    SENHA_HASH, usuario.telefone, 1, usuario.cep, usuario.complemento, usuario.numero, usuario.cpf
  ]);
  return { id, novo: true };
}

async function criarAnuncio(usuario, usuarioId, item, indice) {
  const [titulo, categoria, descricao, conservacao, co2, peso, keyword] = item;
  const existente = await get('SELECT id FROM itens WHERE titulo = ? AND doador_id = ?', [titulo, usuarioId]);
  if (existente) return false;
  const id = crypto.randomUUID();
  await run(`INSERT INTO itens (id, bairro, categoria, cidade, descricao, estado_conservacao,
    impacto_co2kg, latitude, longitude, publicado_em, qr_code_token, status,
    tipo_publicacao, titulo, uf, doador_id, expira_em, cep, complemento, numero, peso_kg)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    id, usuario.bairro, categoria, usuario.cidade, descricao, conservacao, co2,
    usuario.lat, usuario.lng, agora + indice, '', 'ATIVO', indice % 2 ? 'DOAR' : 'TROCAR',
    titulo, usuario.uf, usuarioId, expiraEm, usuario.cep, usuario.complemento, usuario.numero, peso
  ]);
  await run('INSERT INTO item_fotos_urls (item_id, foto_url) VALUES (?,?)', [
    id, `https://loremflickr.com/900/650/${keyword}/all?lock=${5000 + indice}`
  ]);
  return true;
}

async function main() {
  let novosUsuarios = 0;
  let novosAnuncios = 0;
  let novasAvaliacoes = 0;
  const idsUsuarios = [];
  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];
    const resultado = await criarUsuario(usuario);
    idsUsuarios.push(resultado.id);
    if (resultado.novo) novosUsuarios++;
    for (let j = 0; j < 2; j++) {
      if (await criarAnuncio(usuario, resultado.id, anuncios[i][j], i * 2 + j)) novosAnuncios++;
    }
    console.log(`${i + 1}/30 ${usuario.nome} - ${usuario.bairro}, ${usuario.cidade}/${usuario.uf}`);
  }
  for (let i = 0; i < idsUsuarios.length; i++) {
    const proximo = (i + 1) % idsUsuarios.length;
    const anuncio = await get('SELECT id FROM itens WHERE doador_id = ? ORDER BY publicado_em LIMIT 1', [idsUsuarios[i]]);
    if (!anuncio) continue;
    const nota = [5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 5, 4][i % 30];
    const criado = await criarAvaliacaoDeTeste(
      idsUsuarios[i], idsUsuarios[proximo], anuncio.id, nota,
      'Usuario muito atencioso. Negociacao concluida conforme combinado.', i
    );
    if (criado) novasAvaliacoes++;
  }
  await atualizarReputacaoESelos(idsUsuarios);
  console.log(`Carga concluida: ${novosUsuarios} usuarios novos, ${novosAnuncios} anuncios novos, ${novasAvaliacoes} avaliacoes novas.`);
  console.log('30 perfis distintos, 60 anuncios, imagens de perfil/anuncio, selos e nenhuma mensagem criada.');
  db.close();
}

main().catch(error => { console.error('Erro na carga:', error.message); db.close(); process.exitCode = 1; });
