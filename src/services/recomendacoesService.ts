// src/services/recomendacoesService.ts

const BASE_URL = 'https://drivewise-production.up.railway.app'; // Altere se necessário

// Entrada que a tela Comparativo envia
interface RecomendacoesInput {
  quilometragem: number;
  tecnologia: string; // 'combustao' ou 'hibrido'
  uso: string;        // 'urbano' ou 'rodoviario'
}

// Saída que a tela Comparativo espera receber
interface RecomendacoesOutput {
  recomendacoes: string[];
}

/**
 * Serviço responsável por buscar recomendações técnicas da API
 * Usado diretamente em ComparativoScreen.tsx na função addFilter()
 */
export async function obterRecomendacoesAPI(
  input: RecomendacoesInput
): Promise<RecomendacoesOutput> {
  const response = await fetch(`${BASE_URL}/recomendacoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    console.error(`[recomendacoesService] Erro ${response.status}:`, await response.text());
    throw new Error('Erro ao buscar recomendações');
  }

  return await response.json();
}
