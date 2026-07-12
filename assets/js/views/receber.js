/* ============================================================
   TELA: A RECEBER — todos os fretes ainda PENDENTES (qualquer mês).
   Mostra quanto falta receber e deixa marcar como pago.
   ============================================================ */

import { fretes } from '../db.js';
import { brl, numero, dataBr } from '../utils/format.js';
import { calcularFrete } from '../models/frete.js';
import { escapeHtml, toast } from '../utils/ui.js';
import { ICON_RELOGIO, ICON_CHECK } from '../utils/icons.js';

function listarPendentes() {
  return fretes.listar()
    .filter((f) => !f.pago)
    .sort((a, b) => (a.data || '').localeCompare(b.data || ''));
}

function card(f) {
  const valor = calcularFrete(f.litros, f.preco);
  return `
    <article class="card-frete" data-id="${f.id}">
      <div class="card-frete__topo">
        <div>
          <div class="card-frete__rota">${escapeHtml(f.origem)} → ${escapeHtml(f.destino)}</div>
          <div class="card-frete__data">${dataBr(f.data)}${f.cliente ? ' · ' + escapeHtml(f.cliente) : ''}</div>
        </div>
        <span class="card-frete__valor">${brl(valor)}</span>
      </div>
      <div class="card-frete__rodape">
        <span class="card-frete__data">${numero(f.litros)} L</span>
        <button class="btn btn--primary" data-acao="receber" style="padding:9px 16px;font-size:0.9rem">Marcar pago</button>
      </div>
    </article>`;
}

function vazio() {
  return `
    <div class="vazio">
      <div class="vazio__icone icon-verde">${ICON_CHECK}</div>
      <p><strong>Tudo recebido!</strong></p>
      <p>Nenhum frete pendente no momento.</p>
    </div>`;
}

export function render() {
  const pendentes = listarPendentes();
  const total = pendentes.reduce((s, f) => s + calcularFrete(f.litros, f.preco), 0);

  return `
    <h1 class="page-title">A Receber</h1>
    <div class="metric metric--destaque">
      <div>
        <div class="metric__label">Total a receber</div>
        <div class="metric__value metric__value--negativo">${brl(total)}</div>
      </div>
      <div class="metric__icon icon-amarelo">${ICON_RELOGIO}</div>
    </div>
    ${pendentes.length ? `<div class="lista" style="margin-top:var(--gap)">${pendentes.map(card).join('')}</div>` : vazio()}
  `;
}

function rerender() {
  document.getElementById('app').innerHTML = render();
  mount();
}

export function mount() {
  document.querySelectorAll('.card-frete').forEach((el) => {
    const id = el.dataset.id;
    el.querySelector('[data-acao="receber"]')?.addEventListener('click', () => {
      fretes.atualizar(id, { pago: true });
      toast('Frete marcado como pago!');
      rerender();
    });
  });
}
