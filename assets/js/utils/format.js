/* ============================================================
   FORMAT - funções pra mostrar números e datas bonitinhos.
   ============================================================ */

const fmtMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const fmtNumero = new Intl.NumberFormat('pt-BR');

/** 1298.7 -> "R$ 1.298,70" */
export function brl(valor) {
  return fmtMoeda.format(Number(valor) || 0);
}

/** 30000 -> "30.000" */
export function numero(valor) {
  return fmtNumero.format(Number(valor) || 0);
}

/** "2025-11-10" -> "10/11/2025" */
export function dataBr(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Data de hoje no formato que o <input type="date"> entende: "2026-06-22" */
export function hojeIso() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** De "2025-11-10" devolve { ano: 2025, mes: 11 } */
export function partesData(iso) {
  if (!iso) return { ano: null, mes: null };
  const [ano, mes] = iso.split('-').map(Number);
  return { ano, mes };
}
