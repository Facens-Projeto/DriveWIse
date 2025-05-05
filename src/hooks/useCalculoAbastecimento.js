import { useState } from 'react';

export function useCalculoAbastecimento() {
  const [ultimoCampoEditado, setUltimoCampoEditado] = useState(null);

  const df = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function extrairNumero(texto) {
    const limpo = texto
      .replace("R$", "")
      .replace("L", "")
      .replace(" ", "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    const valor = parseFloat(limpo);
    return isNaN(valor) ? null : valor;
  }

  function formatarCampoMonetario(valor) {
    return `R$ ${df.format(valor)}`;
  }

  function formatarCampoLitros(valor) {
    return `${df.format(valor)} L`;
  }

  function calcularAutomaticamente({ preco, total, litros }) {
    if (preco != null && total != null && litros == null && ultimoCampoEditado !== "litros") {
      return { litros: formatarCampoLitros(total / preco) };
    } else if (preco != null && litros != null && total == null && ultimoCampoEditado !== "total") {
      return { total: formatarCampoMonetario(preco * litros) };
    } else if (total != null && litros != null && preco == null && ultimoCampoEditado !== "preco") {
      return { preco: formatarCampoMonetario(total / litros) };
    }
    return {};
  }

  return {
    extrairNumero,
    formatarCampoMonetario,
    formatarCampoLitros,
    calcularAutomaticamente,
    setUltimoCampoEditado,
    ultimoCampoEditado,
  };
}
