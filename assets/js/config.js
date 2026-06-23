/* ============================================================
   CONFIGURACAO DO NEGOCIO
   Cidades, destinos e a tabela de precos.
   Pra mudar um preco, e so editar aqui.
   ============================================================ */

// Cidades de onde o caminhao sai (origem)
export const ORIGENS = [
  'Cidade A',
  'Cidade B',
  'Cidade C',
];

// Para onde vai (destino)
export const DESTINOS = [
  'Destino 1',
  'Destino 2',
  'Destino 3',
];

// Tabela de precos: R$ cobrado por litro transportado, conforme a rota.
// ATENCAO: valores de exemplo. Troque pelos precos que voce cobra de verdade.
export const TABELA_PRECOS = {
  'Cidade A': { 'Destino 1': 0.10, 'Destino 2': 0.15, 'Destino 3': 0.20 },
  'Cidade B': { 'Destino 1': 0.10, 'Destino 2': 0.15 },
  'Cidade C': { 'Destino 1': 0.10, 'Destino 2': 0.15 },
};

/** Retorna o preco por litro de uma rota, ou null se a rota nao existir. */
export function precoPorLitro(origem, destino) {
  const linha = TABELA_PRECOS[origem];
  if (!linha) return null;
  const preco = linha[destino];
  return preco ?? null;
}

// Distancia de cada rota, em km, apenas IDA. Valores de exemplo.
export const DISTANCIAS = {
  'Cidade A': { 'Destino 1': 100, 'Destino 2': 150, 'Destino 3': 200 },
  'Cidade B': { 'Destino 1': 100, 'Destino 2': 150 },
  'Cidade C': { 'Destino 1': 100, 'Destino 2': 150 },
};

/** Km de uma rota. Por padrao considera IDA E VOLTA. */
export function kmRota(origem, destino, idaVolta = true) {
  const linha = DISTANCIAS[origem];
  if (!linha) return null;
  const km = linha[destino];
  if (km == null) return null;
  return idaVolta ? km * 2 : km;
}
