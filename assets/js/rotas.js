/* ============================================================
   ROTAS - as rotas do motorista: origem, destino, preço por litro e km.
   Ficam salvas no localStorage, não no código, porque cada motorista
   cobra um preço diferente e isso não deve ir parar no repositório.
   ============================================================ */

import { load, save } from './storage.js';

const CHAVE = 'rotas';

// Rotas de exemplo, usadas só enquanto o usuário não cadastrar as dele.
// São valores fictícios de propósito.
export const ROTAS_EXEMPLO = [
  { origem: 'Cidade A', destino: 'Destino 1', preco: 0.10, km: 100 },
  { origem: 'Cidade A', destino: 'Destino 2', preco: 0.15, km: 150 },
  { origem: 'Cidade B', destino: 'Destino 1', preco: 0.10, km: 200 },
];

/** Lista todas as rotas cadastradas (ou as de exemplo, se não houver nenhuma). */
export function listarRotas() {
  const salvas = load(CHAVE, null);
  if (!Array.isArray(salvas) || salvas.length === 0) return ROTAS_EXEMPLO;
  return salvas;
}

/** Diz se o usuário já cadastrou as rotas dele (ou ainda está vendo as de exemplo). */
export function rotasConfiguradas() {
  const salvas = load(CHAVE, null);
  return Array.isArray(salvas) && salvas.length > 0;
}

/** Grava a lista inteira de rotas. */
export function salvarRotas(lista) {
  save(CHAVE, Array.isArray(lista) ? lista : []);
}

/** Procura uma rota pela origem e destino. */
function acharRota(origem, destino) {
  return listarRotas().find((r) => r.origem === origem && r.destino === destino) || null;
}

/** Adiciona uma rota nova (ou atualiza, se origem e destino já existirem). */
export function salvarRota({ origem, destino, preco, km }) {
  const lista = rotasConfiguradas() ? listarRotas().slice() : [];
  const nova = {
    origem: String(origem).trim(),
    destino: String(destino).trim(),
    preco: Number(preco) || 0,
    km: Number(km) || 0,
  };
  const i = lista.findIndex((r) => r.origem === nova.origem && r.destino === nova.destino);
  if (i === -1) lista.push(nova);
  else lista[i] = nova;
  salvarRotas(lista);
  return nova;
}

/** Remove uma rota. */
export function removerRota(origem, destino) {
  const lista = listarRotas().filter((r) => !(r.origem === origem && r.destino === destino));
  salvarRotas(lista);
}

/** Lista de cidades de origem, sem repetir. */
export function origens() {
  return [...new Set(listarRotas().map((r) => r.origem))];
}

/** Lista de destinos, sem repetir. */
export function destinos() {
  return [...new Set(listarRotas().map((r) => r.destino))];
}

/** Preço por litro de uma rota, ou null se a rota não existir. */
export function precoPorLitro(origem, destino) {
  const r = acharRota(origem, destino);
  return r ? r.preco : null;
}

/**
 * Km de uma rota. Por padrão considera IDA E VOLTA (dobra a distância),
 * porque o desgaste do caminhão acontece nos dois sentidos mesmo voltando vazio.
 * Retorna null se a rota não existir ou não tiver km cadastrado.
 */
export function kmRota(origem, destino, idaVolta = true) {
  const r = acharRota(origem, destino);
  if (!r || !r.km) return null;
  return idaVolta ? r.km * 2 : r.km;
}
