/* ============================================================
   TELA: ABASTECIMENTO — controle de combustível do caminhão.
   Registra litros, valor e o km do odômetro; calcula a média km/L.
   ============================================================ */

import { abastecimentos } from '../db.js';
import { brl, numero, dataBr, hojeIso } from '../utils/format.js';
import { toast } from '../utils/ui.js';
import { ICON_FUEL, ICON_TRASH } from '../utils/icons.js';

/** Média km por litro: distância total percorrida ÷ litros abastecidos. */
function calcularMedia(lista) {
  if (lista.length < 2) return null;
  const comKm = lista.filter((a) => Number(a.km) > 0).map((a) => Number(a.km));
  if (comKm.length < 2) return null;
  const distancia = Math.max(...comKm) - Math.min(...comKm);
  const litrosTotais = lista.reduce((s, a) => s + (Number(a.litros) || 0), 0);
  if (litrosTotais <= 0 || distancia <= 0) return null;
  return distancia / litrosTotais;
}

function cardAbast(a) {
  return `
    <article class="card-frete" data-id="${a.id}">
      <div class="card-frete__topo">
        <div>
          <div class="card-frete__rota">${numero(a.litros)} L · ${brl(a.valor)}</div>
          <div class="card-frete__data">${dataBr(a.data)}${Number(a.km) ? ' · ' + numero(a.km) + ' km' : ''}</div>
        </div>
        <button class="icon-btn" data-acao="excluir" title="Excluir">${ICON_TRASH}</button>
      </div>
    </article>`;
}

export function render() {
  const lista = abastecimentos.listar()
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  const media = calcularMedia(lista);

  return `
    <h1 class="page-title">Abastecimentos</h1>

    <form class="form" id="form-abast" novalidate style="margin-bottom:var(--gap-lg)">
      <div class="field">
        <label class="field__label" for="ab-data">Data</label>
        <input class="input" type="date" id="ab-data" value="${hojeIso()}" />
      </div>
      <div class="field" id="campo-ab-litros">
        <label class="field__label" for="ab-litros">Litros abastecidos</label>
        <input class="input" type="number" id="ab-litros" inputmode="decimal" min="0" step="0.01" placeholder="Ex: 200" />
        <small class="field__erro"></small>
      </div>
      <div class="field" id="campo-ab-valor">
        <label class="field__label" for="ab-valor">Valor pago (R$)</label>
        <input class="input" type="number" id="ab-valor" inputmode="decimal" min="0" step="0.01" placeholder="Ex: 1200,00" />
        <small class="field__erro"></small>
      </div>
      <div class="field">
        <label class="field__label" for="ab-km">Km do painel <span class="field__hint">(odômetro, opcional)</span></label>
        <input class="input" type="number" id="ab-km" inputmode="numeric" min="0" placeholder="Ex: 154300" />
      </div>
      <button type="submit" class="btn btn--primary btn--block">${ICON_FUEL} Registrar abastecimento</button>
    </form>

    ${media ? `
      <div class="metric metric--destaque">
        <div>
          <div class="metric__label">Média de consumo</div>
          <div class="metric__value metric__value--positivo">${media.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} km/L</div>
        </div>
        <div class="metric__icon icon-verde">${ICON_FUEL}</div>
      </div>` : ''}

    <div class="section-title">Histórico</div>
    ${lista.length
      ? `<div class="lista">${lista.map(cardAbast).join('')}</div>`
      : `<div class="vazio"><div class="vazio__icone icon-coral">${ICON_FUEL}</div><p><strong>Sem abastecimentos ainda</strong></p></div>`}
  `;
}

function rerender() {
  document.getElementById('app').innerHTML = render();
  mount();
}

export function mount() {
  const form = document.getElementById('form-abast');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const litros = Number(document.getElementById('ab-litros').value);
    const valor = Number(document.getElementById('ab-valor').value);

    let ok = true;
    const marcarErro = (campoId, mostrar) => {
      const campo = document.getElementById(campoId);
      campo?.classList.toggle('field--erro', mostrar);
      if (mostrar) ok = false;
    };
    marcarErro('campo-ab-litros', !litros || litros <= 0);
    marcarErro('campo-ab-valor', !valor || valor <= 0);
    if (!ok) { toast('Preencha litros e valor.'); return; }

    abastecimentos.adicionar({
      data: document.getElementById('ab-data').value,
      litros,
      valor,
      km: Number(document.getElementById('ab-km').value) || 0,
    });
    toast('Abastecimento registrado!');
    rerender();
  });

  document.querySelectorAll('.card-frete').forEach((el) => {
    el.querySelector('[data-acao="excluir"]')?.addEventListener('click', () => {
      if (confirm('Excluir este abastecimento?')) {
        abastecimentos.remover(el.dataset.id);
        toast('Excluído');
        rerender();
      }
    });
  });
}
