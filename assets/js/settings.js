/* ============================================================
   SETTINGS - configurações do veículo do usuário (informadas 1 vez).
   Servem de base para calcular a depreciação (desgaste) por km.
   ============================================================ */

import { load, save } from './storage.js';

const CHAVE = 'veiculo';

// Valores padrão (tudo zerado até o usuário configurar).
const PADRAO = {
  valorCompra: 0,      // quanto pagou no caminhão (ou valor atual)
  valorRevenda: 0,     // quanto espera receber ao vendê-lo
  vidaUtilKm: 0,       // quantos km o caminhão deve rodar na vida toda
  precoJogoPneus: 0,   // preço do jogo completo de pneus
  vidaUtilPneusKm: 0,  // quantos km um jogo de pneus dura
};

/** Lê as configurações do veículo (sempre com os campos padrão preenchidos). */
export function lerVeiculo() {
  return { ...PADRAO, ...(load(CHAVE, {}) || {}) };
}

/** Salva (mescla) as configurações do veículo. */
export function salvarVeiculo(dados) {
  save(CHAVE, { ...lerVeiculo(), ...dados });
}

/** Diz se já dá para calcular alguma depreciação (veículo OU pneus configurado). */
export function veiculoConfigurado() {
  const v = lerVeiculo();
  return (v.vidaUtilKm > 0 && v.valorCompra > 0) || (v.vidaUtilPneusKm > 0 && v.precoJogoPneus > 0);
}
