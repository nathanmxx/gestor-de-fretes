/* ============================================================
   MODELO DEPRECIAÇÃO — o "desgaste" (custo invisível) por km.
   Método linear por km: o caminhão e os pneus se gastam rodando,
   então diluímos o custo deles ao longo da vida útil em km.
   ============================================================ */

import { lerVeiculo } from '../settings.js';

function duasCasas(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Quanto o VEÍCULO perde de valor a cada km rodado.
 * = (valor de compra − valor de revenda) ÷ vida útil em km
 */
export function custoVeiculoPorKm(v = lerVeiculo()) {
  if (!v.vidaUtilKm || v.vidaUtilKm <= 0) return 0;
  const perda = (Number(v.valorCompra) || 0) - (Number(v.valorRevenda) || 0);
  if (perda <= 0) return 0;
  return perda / v.vidaUtilKm;
}

/**
 * Quanto os PNEUS custam a cada km rodado.
 * = preço do jogo ÷ vida útil dos pneus em km
 */
export function custoPneusPorKm(v = lerVeiculo()) {
  if (!v.vidaUtilPneusKm || v.vidaUtilPneusKm <= 0) return 0;
  const preco = Number(v.precoJogoPneus) || 0;
  if (preco <= 0) return 0;
  return preco / v.vidaUtilPneusKm;
}

/** Desgaste total por km = veículo + pneus. */
export function desgastePorKm(v = lerVeiculo()) {
  return custoVeiculoPorKm(v) + custoPneusPorKm(v);
}

/** Depreciação (R$) para uma quantidade de km rodados. */
export function depreciacaoDeKm(km, v = lerVeiculo()) {
  return duasCasas((Number(km) || 0) * desgastePorKm(v));
}
