// api.js — BACKEND EXPRESS
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
const collectionName = 'veiculos';

app.get('/veiculos', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const dados = await collection.find({}).toArray();
    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar veiculos:', err);
    res.status(500).json({ erro: 'Erro ao buscar veiculos' });
  }
});

app.post('/veiculo', async (req, res) => {
  try {
    const novo = req.body;
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const resultado = await collection.insertOne(novo);
    res.json({ ok: true, insertedId: resultado.insertedId });
  } catch (err) {
    console.error('Erro ao salvar veiculo:', err);
    res.status(500).json({ erro: 'Erro ao salvar veiculo' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});

