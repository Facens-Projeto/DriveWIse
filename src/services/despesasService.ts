import { getUserId } from './firebase';
import { v4 as uuidv4 } from 'uuid'; // Importa o UUID

const BASE_URL = 'https://drivewise-production.up.railway.app';

export async function buscarDespesasUsuario() {
  const uid = await getUserId();
  const response = await fetch(`${BASE_URL}/despesas/${uid}`);
  if (!response.ok) throw new Error('Erro ao buscar despesas');

  const data = await response.json();

  // Corrige: garante que cada item tenha `id` (usa _id do MongoDB se não tiver)
  const normalizados = data.map((d: any) => ({
    ...d,
    id: d.id || d._id || uuidv4(), // garante campo `id` único
  }));

  return normalizados;
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
