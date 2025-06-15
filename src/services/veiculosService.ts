// src/services/veiculosService.ts
import { getCollection } from './communityDB';

export async function cadastrarVeiculoMongo(veiculo: any) {
  const collection = await getCollection('veiculos');
  return await collection.insertOne(veiculo);
}

export async function buscarVeiculosDoUsuario(uid: string) {
  const collection = await getCollection('veiculos');
  return await collection.find({ uid }).toArray();
}
