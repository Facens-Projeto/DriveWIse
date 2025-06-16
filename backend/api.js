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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
