/* ============================================================
   STATE - estado compartilhado entre telas.
   Por enquanto guarda só o filtro de mês/ano selecionado,
   pra ele continuar igual ao navegar entre Resumo e Fretes.
   ============================================================ */

import { MESES, partesData } from './utils/format.js';

const hoje = new Date();

// Mês/ano atualmente selecionado (vale durante a sessão)
export const filtro = {
  mes: hoje.getMonth() + 1,
  ano: hoje.getFullYear(),
};

/** Anos que aparecem no seletor (atual e alguns ao redor). */
function anosDisponiveis() {
  const atual = new Date().getFullYear();
  return [atual + 1, atual, atual - 1, atual - 2];
}

/** Monta o HTML dos dois seletores (mês e ano). */
export function seletorMesAnoHtml() {
  const meses = MESES
    .map((m, i) => `<option value="${i + 1}" ${i + 1 === filtro.mes ? 'selected' : ''}>${m}</option>`)
    .join('');
  const anos = anosDisponiveis()
    .map((a) => `<option value="${a}" ${a === filtro.ano ? 'selected' : ''}>${a}</option>`)
    .join('');
  return `
    <div class="filtros">
      <select class="select" id="filtro-mes" aria-label="Mês">${meses}</select>
      <select class="select" id="filtro-ano" aria-label="Ano">${anos}</select>
    </div>`;
}

/** Liga os seletores: quando mudam, atualiza o filtro e chama aoMudar(). */
export function ligarSeletorMesAno(aoMudar) {
  const mes = document.getElementById('filtro-mes');
  const ano = document.getElementById('filtro-ano');
  mes?.addEventListener('change', (e) => { filtro.mes = Number(e.target.value); aoMudar(); });
  ano?.addEventListener('change', (e) => { filtro.ano = Number(e.target.value); aoMudar(); });
}

/** Diz se um registro (com campo .data) cai no mês/ano filtrado. */
export function noMesFiltro(item) {
  const { ano, mes } = partesData(item.data);
  return ano === filtro.ano && mes === filtro.mes;
}
