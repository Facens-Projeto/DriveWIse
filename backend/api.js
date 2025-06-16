// backend/api.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = 'drivewise';
const veiculosCollection = 'veiculos';
const abastecimentosCollection = 'abastecimentos';

// ✅ Rota para verificar se a API está online
app.get('/', (req, res) => {
  res.send('API DriveWise está online 🚀');
});

// ✅ GET todos os abastecimentos (para uso global)
app.get('/abastecimentos', async (req, res) => {
  try {
    await client.connect();
    const dados = await client.db(dbName).collection(abastecimentosCollection).find({}).toArray();
    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar abastecimentos globais:', err);
    res.status(500).json({ erro: 'Erro ao buscar abastecimentos globais' });
  }
});


// ✅ GET todos os veículos
app.get('/veiculos', async (req, res) => {
  try {
    await client.connect();
    const dados = await client.db(dbName).collection(veiculosCollection).find({}).toArray();
    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar veículos:', err);
    res.status(500).json({ erro: 'Erro ao buscar veículos' });
  }
});

// ✅ GET veículos por UID
app.get('/veiculos/:uid', async (req, res) => {
  try {
    await client.connect();
    const dados = await client.db(dbName).collection(veiculosCollection).find({ uid: req.params.uid }).toArray();
    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar veículos por uid:', err);
    res.status(500).json({ erro: 'Erro ao buscar veículos por usuário' });
  }
});

// ✅ POST novo veículo
app.post('/veiculos', async (req, res) => {
  try {
    const novo = req.body;

    // 🐞 Log para depuração
    console.log('📥 Dados recebidos no backend (cadastro de veículo):');
    console.log(JSON.stringify(novo, null, 2));

    await client.connect();
    const resultado = await client.db(dbName).collection(veiculosCollection).insertOne(novo);
    res.json({ ok: true, insertedId: resultado.insertedId });
  } catch (err) {
    console.error('❌ Erro ao salvar veículo:', err);
    res.status(500).json({ erro: 'Erro ao salvar veículo' });
  }
});

// ✅ POST novo abastecimento
app.post('/abastecimentos', async (req, res) => {
  try {
    const novo = req.body;
    await client.connect();
    const resultado = await client.db(dbName).collection(abastecimentosCollection).insertOne(novo);
    res.json({ ok: true, insertedId: resultado.insertedId });
  } catch (err) {
    console.error('Erro ao salvar abastecimento:', err);
    res.status(500).json({ erro: 'Erro ao salvar abastecimento' });
  }
});

// ✅ GET abastecimentos por UID
app.get('/abastecimentos/:uid', async (req, res) => {
  try {
    await client.connect();
    const dados = await client.db(dbName).collection(abastecimentosCollection).find({ uid: req.params.uid }).toArray();
    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar abastecimentos:', err);
    res.status(500).json({ erro: 'Erro ao buscar abastecimentos' });
  }
});

// ✅ PATCH atualização da quilometragem do veículo por UID
app.patch('/quilometragem/:uid', async (req, res) => {
  try {
    const { quilometragem } = req.body;
    await client.connect();
    const resultado = await client.db(dbName).collection(veiculosCollection).updateOne(
      { uid: req.params.uid },
      { $set: { 'veiculo.quilometragem': quilometragem } }
    );
    res.json({ ok: true, matchedCount: resultado.matchedCount });
  } catch (err) {
    console.error('Erro ao atualizar quilometragem:', err);
    res.status(500).json({ erro: 'Erro ao atualizar quilometragem' });
  }
});

// ✅ Nova rota para cálculo de estatísticas comunitárias
app.get('/estatisticas', async (req, res) => {
  try {
    await client.connect();

    const veiculos = await client.db(dbName).collection(veiculosCollection).find({}).toArray();
    const abastecimentos = await client.db(dbName).collection(abastecimentosCollection).find({}).toArray();

    const modelosMap = {}; // chave: "marca|modelo|cidade" => lista de abastecimentos

    // 🔁 Adiciona abastecimentos antigos (do campo abastecimentos dentro de veiculos)
    for (const doc of veiculos) {
      const { veiculo, condutor, uid } = doc;
      const abasts = doc.abastecimentos || [];

      for (const a of abasts) {
        const chave = `${veiculo.marca}|${veiculo.modelo}|${condutor?.cidade || 'Desconhecida'}`;
        if (!modelosMap[chave]) modelosMap[chave] = [];
        modelosMap[chave].push({ ...a, uid });
      }
    }

    // 🔁 Adiciona abastecimentos novos (coleção separada)
    for (const a of abastecimentos) {
      const veiculo = veiculos.find(v => v.uid === a.uid);
      if (!veiculo) continue;
      const chave = `${veiculo.veiculo.marca}|${veiculo.veiculo.modelo}|${veiculo.condutor?.cidade || 'Desconhecida'}`;
      if (!modelosMap[chave]) modelosMap[chave] = [];
      modelosMap[chave].push(a);
    }

    const resultado = [];

    for (const chave in modelosMap) {
      const [marca, modelo, cidade] = chave.split('|');
      const lista = modelosMap[chave]
        .filter((a) => a.km && a.litros > 0)
        .sort((a, b) => a.km - b.km);

      const rendimentos = { gasolina: [], alcool: [] };

      for (let i = 1; i < lista.length; i++) {
        const atual = lista[i];
        const anterior = lista[i - 1];

        const tipo = atual.tipo?.toLowerCase();
        if (!['gasolina', 'álcool', 'alcool'].includes(tipo)) continue;
        const tipoKey = tipo === 'álcool' ? 'alcool' : tipo;

        const trajeto = atual.km - anterior.km;
        if (trajeto > 0 && anterior.litros > 0) {
          const rendimento = trajeto / anterior.litros;
          rendimentos[tipoKey].push(rendimento);
        }
      }

      const mediaGas = rendimentos.gasolina.length > 0 ? (rendimentos.gasolina.reduce((a, b) => a + b, 0) / rendimentos.gasolina.length) : 0;
      const mediaAlc = rendimentos.alcool.length > 0 ? (rendimentos.alcool.reduce((a, b) => a + b, 0) / rendimentos.alcool.length) : 0;

      resultado.push({
        marca,
        modelo,
        cidade,
        count: lista.length,
        avgEfficiency: {
          gasolina: parseFloat(mediaGas.toFixed(2)),
          alcool: parseFloat(mediaAlc.toFixed(2)),
        },
      });
    }

    res.json(resultado);
  } catch (err) {
    console.error('Erro ao gerar estatísticas:', err);
    res.status(500).json({ erro: 'Erro ao gerar estatísticas' });
  }
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
