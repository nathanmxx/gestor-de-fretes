/* ============================================================
   CSV - exportar e importar os fretes como planilha (.csv).
   Serve de BACKUP e também abre direto no Excel, igual à
   planilha que o motorista já conhece.
   ============================================================ */

import { calcularFrete, calcularLucro } from '../models/frete.js';
import { precoPorLitro } from '../rotas.js';

// Ordem das colunas no arquivo (mesma ideia da planilha original)
const COLUNAS = ['DATA', 'ORIGEM', 'DESTINO', 'CLIENTE', 'LITROS', 'PRECO', 'FRETE', 'DESPESAS', 'LUCRO', 'SITUACAO'];

/** Escapa um campo pra não quebrar o CSV se tiver vírgula/aspas. */
function campo(valor) {
  const texto = String(valor ?? '');
  if (/[",;\n]/.test(texto)) {
    return '"' + texto.replace(/"/g, '""') + '"';
  }
  return texto;
}

/** Transforma a lista de fretes num texto CSV (separador ";", padrão BR do Excel). */
export function fretesParaCsv(fretes) {
  const linhas = [COLUNAS.join(';')];
  for (const f of fretes) {
    const valorFrete = calcularFrete(f.litros, f.preco);
    const lucro = calcularLucro(valorFrete, f.despesas);
    linhas.push([
      f.data,
      f.origem,
      f.destino,
      f.cliente || '',
      f.litros,
      String(f.preco).replace('.', ','),
      String(valorFrete).replace('.', ','),
      String(f.despesas || 0).replace('.', ','),
      String(lucro).replace('.', ','),
      f.pago ? 'PAGO' : 'PENDENTE',
    ].map(campo).join(';'));
  }
  return linhas.join('\r\n');
}

/** Dispara o download do arquivo .csv no navegador. */
export function baixarCsv(fretes) {
  const csv = fretesParaCsv(fretes);
  // ﻿ (BOM) faz o Excel abrir os acentos corretamente
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fretes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Lê um texto CSV e devolve uma lista de fretes pronta pra importar.
 * Aceita "," ou "." nos números e vírgula/ponto-e-vírgula como separador.
 */
export function csvParaFretes(texto) {
  const linhas = texto.replace(/^﻿/, '').trim().split(/\r?\n/);
  if (linhas.length < 2) return [];

  const sep = linhas[0].includes(';') ? ';' : ',';
  const cabecalho = linhas[0].split(sep).map((c) => c.trim().toUpperCase());
  const idx = (nome) => cabecalho.indexOf(nome);

  const fretes = [];
  for (let i = 1; i < linhas.length; i++) {
    const cols = linhas[i].split(sep);
    if (cols.length < 3) continue;

    const num = (s) => Number(String(s ?? '').replace(/\./g, '').replace(',', '.')) || 0;
    const origem = cols[idx('ORIGEM')]?.trim();
    const destino = cols[idx('DESTINO')]?.trim();

    fretes.push({
      data: cols[idx('DATA')]?.trim() || '',
      origem,
      destino,
      cliente: cols[idx('CLIENTE')]?.trim() || '',
      litros: num(cols[idx('LITROS')]),
      // se o CSV não trouxer preço, busca pela tabela de rotas
      preco: num(cols[idx('PRECO')]) || precoPorLitro(origem, destino) || 0,
      despesas: num(cols[idx('DESPESAS')]),
      pago: (cols[idx('SITUACAO')]?.trim().toUpperCase() === 'PAGO'),
    });
  }
  return fretes;
}
