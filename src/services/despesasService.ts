// src/services/despesasService.ts
import { getUserId } from './firebase';

const BASE_URL = 'https://drivewise-production.up.railway.app';

export async function buscarDespesasUsuario() {
  const uid = await getUserId();
  const response = await fetch(`${BASE_URL}/despesas/${uid}`);
  if (!response.ok) throw new Error('Erro ao buscar despesas');
  return await response.json();
}

export async function cadastrarDespesa(despesa: any) {
  const uid = await getUserId();
  const response = await fetch(`${BASE_URL}/despesas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, ...despesa }),
  });
  if (!response.ok) throw new Error('Erro ao salvar despesa');
  return await response.json();
}
