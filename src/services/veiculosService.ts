// const BASE_URL = 'https://drivewise-production.up.railway.app';
const BASE_URL = 'http://192.168.0.X:8080'; // seu IP local
// Salva novo veículo
export async function cadastrarVeiculoMongo(veiculo: any) {
    console.log('Enviando para a API:', JSON.stringify(veiculo, null, 2)); // 👈
  const response = await fetch(`${BASE_URL}/veiculos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(veiculo),
  });
  if (!response.ok) throw new Error('Erro ao cadastrar veículo na API');
  return await response.json();
}

// Busca veículos por UID
export async function buscarVeiculosDoUsuario(uid: string) {
  const response = await fetch(`${BASE_URL}/veiculos/${uid}`);
  if (!response.ok) throw new Error('Erro ao buscar veículos do usuário');
  return await response.json();
}

// Busca todos os veículos (comunitários)
export async function buscarTodosVeiculos() {
  const response = await fetch(`${BASE_URL}/veiculos`);
  if (!response.ok) throw new Error('Erro ao buscar veículos comunitários');
  return await response.json();
}

// ✅ Novo: Cadastrar abastecimento
export async function cadastrarAbastecimento(uid: string, abastecimento: any) {
  const response = await fetch(`${BASE_URL}/abastecimentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, ...abastecimento }),
  });
  if (!response.ok) throw new Error('Erro ao cadastrar abastecimento');
  return await response.json();
}

// ✅ Novo: Buscar abastecimentos de um usuário
export async function buscarAbastecimentosDoUsuario(uid: string) {
  const response = await fetch(`${BASE_URL}/abastecimentos/${uid}`);
  if (!response.ok) throw new Error('Erro ao buscar abastecimentos');
  return await response.json();
}

// ✅ Novo: Atualizar quilometragem do veículo
export async function atualizarQuilometragem(uid: string, quilometragem: number) {
  const response = await fetch(`${BASE_URL}/quilometragem/${uid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quilometragem }),
  });
  if (!response.ok) throw new Error('Erro ao atualizar quilometragem');
  return await response.json();
}
