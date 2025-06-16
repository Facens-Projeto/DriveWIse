import axios from 'axios';
const BASE_URL = 'https://drivewise-production.up.railway.app';

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
// ✅ Novo: Buscar todos os abastecimentos (globais)
export async function buscarAbastecimentosGlobais() {
  const response = await fetch(`${BASE_URL}/abastecimentos`);
  if (!response.ok) throw new Error('Erro ao buscar abastecimentos globais');
  return await response.json();
}

export async function atualizarMediaEficiencia(uid: string) {
  try {
    // Busca os abastecimentos do usuário
    const respAbast = await axios.get(`${BASE_URL}/abastecimentos/${uid}`);
    const abastecimentos = respAbast.data;

    // Filtra e organiza os dados por tipo
    const rendimentos: { [key: string]: number[] } = {
      gasolina: [],
      alcool: []
    };

    const lista = abastecimentos
      .filter((a: any) => a.km && a.litros > 0)
      .sort((a: any, b: any) => a.km - b.km);

    for (let i = 1; i < lista.length; i++) {
      const atual = lista[i];
      const anterior = lista[i - 1];
      const tipo = atual.tipo?.toLowerCase();

      const tipoKey = tipo === 'álcool' ? 'alcool' : tipo;
      if (!['gasolina', 'alcool'].includes(tipoKey)) continue;

      const trajeto = atual.km - anterior.km;
      if (trajeto > 0 && anterior.litros > 0) {
        const rendimento = trajeto / anterior.litros;
        rendimentos[tipoKey].push(rendimento);
      }
    }

    const mediaGasolina = rendimentos.gasolina.length > 0
      ? rendimentos.gasolina.reduce((a, b) => a + b, 0) / rendimentos.gasolina.length
      : 0;

    const mediaAlcool = rendimentos.alcool.length > 0
      ? rendimentos.alcool.reduce((a, b) => a + b, 0) / rendimentos.alcool.length
      : 0;

    // Atualiza o veículo com as médias
    await axios.patch(`${BASE_URL}/veiculos/${uid}`, {
      avgEfficiency: {
        gasolina: parseFloat(mediaGasolina.toFixed(2)),
        alcool: parseFloat(mediaAlcool.toFixed(2))
      }
    });

    console.log('✅ Média de eficiência atualizada com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao atualizar média de eficiência:', error);
  }
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
