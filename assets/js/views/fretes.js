/* ============================================================
   TELA: FRETES - lista dos fretes do mês selecionado.
   ============================================================ */

import { fretes } from '../db.js';
import { brl, numero, dataBr } from '../utils/format.js';
import { calcularFrete } from '../models/frete.js';
import { filtro, seletorMesAnoHtml, ligarSeletorMesAno, noMesFiltro } from '../state.js';
import { escapeHtml, toast } from '../utils/ui.js';
import { ICON_CHECK, ICON_EDIT, ICON_TRASH, ICON_CAIXA } from '../utils/icons.js';

function cardFrete(f) {
  const valor = calcularFrete(f.litros, f.preco);
  return `
    <article class="card-frete" data-id="${f.id}">
      <div class="card-frete__topo">
        <div>
          <div class="card-frete__rota">${escapeHtml(f.origem)} → ${escapeHtml(f.destino)}</div>
          <div class="card-frete__data">${dataBr(f.data)}${f.cliente ? ' · ' + escapeHtml(f.cliente) : ''}</div>
        </div>
        <span class="badge ${f.pago ? 'badge--pago' : 'badge--pendente'}">${f.pago ? 'Pago' : 'Pendente'}</span>
      </div>
      <div class="card-frete__info">
        <span>${numero(f.litros)} L</span>
        <span>R$ ${String(f.preco).replace('.', ',')}/L</span>
        ${Number(f.despesas) ? `<span>Despesas: ${brl(f.despesas)}</span>` : ''}
      </div>
      <div class="card-frete__rodape">
        <span class="card-frete__valor">${brl(valor)}</span>
        <div class="card-frete__acoes">
          <button class="icon-btn" data-acao="pago" title="Alternar pago/pendente">${ICON_CHECK}</button>
          <a class="icon-btn" href="#/frete?id=${f.id}" title="Editar">${ICON_EDIT}</a>
          <button class="icon-btn" data-acao="excluir" title="Excluir">${ICON_TRASH}</button>
        </div>
      </div>
    </article>`;
}

function estadoVazio() {
  return `
    <div class="vazio">
      <div class="vazio__icone icon-coral">${ICON_CAIXA}</div>
      <p><strong>Nenhum frete neste mês</strong></p>
      <p>Toque em "Novo frete" pra registrar o primeiro.</p>
    </div>`;
}

export function render() {
  const lista = fretes.listar()
    .filter(noMesFiltro)
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  return `
    <h1 class="page-title">Meus Fretes</h1>
    ${seletorMesAnoHtml()}
    <a href="#/frete" class="btn btn--primary btn--block" style="margin-bottom:var(--gap)">+ Novo frete</a>
    ${lista.length ? `<div class="lista">${lista.map(cardFrete).join('')}</div>` : estadoVazio()}
  `;
}

function rerender() {
  document.getElementById('app').innerHTML = render();
  mount();
}

export function mount() {
  ligarSeletorMesAno(rerender);

  document.querySelectorAll('.card-frete').forEach((card) => {
    const id = card.dataset.id;

    card.querySelector('[data-acao="pago"]')?.addEventListener('click', () => {
      const f = fretes.pegar(id);
      fretes.atualizar(id, { pago: !f.pago });
      toast(f.pago ? 'Marcado como pendente' : 'Marcado como pago');
      rerender();
    });

    card.querySelector('[data-acao="excluir"]')?.addEventListener('click', () => {
      if (confirm('Excluir este frete? Não dá pra desfazer.')) {
        fretes.remover(id);
        toast('Frete excluído');
        rerender();
      }
    });
  });
}
