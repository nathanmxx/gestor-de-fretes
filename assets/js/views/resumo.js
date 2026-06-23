/* ============================================================
   TELA: RESUMO — painel com os totais do mês.
   ============================================================ */

import { fretes, abastecimentos } from '../db.js';
import { brl, numero } from '../utils/format.js';
import { calcularFrete } from '../models/frete.js';
import { filtro, seletorMesAnoHtml, ligarSeletorMesAno, noMesFiltro } from '../state.js';
import { ICON_UP, ICON_CIFRAO, ICON_CAIXA, ICON_RELOGIO, ICON_CAMINHAO } from '../utils/icons.js';

function calcularTotais() {
  const fre = fretes.listar().filter(noMesFiltro);
  const aba = abastecimentos.listar().filter(noMesFiltro);

  let receitas = 0, despesas = 0, litros = 0, aReceber = 0;
  for (const f of fre) {
    const valor = calcularFrete(f.litros, f.preco);
    receitas += valor;
    despesas += Number(f.despesas) || 0;
    litros += Number(f.litros) || 0;
    if (!f.pago) aReceber += valor;
  }
  for (const a of aba) despesas += Number(a.valor) || 0;

  return { receitas, despesas, saldo: receitas - despesas, litros, aReceber };
}

function metric(label, valor, icone, classeIcone, classeValor = '') {
  return `
    <div class="metric">
      <div>
        <div class="metric__label">${label}</div>
        <div class="metric__value ${classeValor}">${valor}</div>
      </div>
      <div class="metric__icon ${classeIcone}">${icone}</div>
    </div>`;
}

export function render() {
  const t = calcularTotais();
  return `
    <h1 class="page-title">Resumo</h1>
    ${seletorMesAnoHtml()}

    ${metric('Receitas', brl(t.receitas), ICON_UP, 'icon-coral')}
    ${metric('Despesas', brl(t.despesas), ICON_CIFRAO, 'icon-coral')}
    <div class="metric metric--destaque">
      <div>
        <div class="metric__label">Saldo (lucro)</div>
        <div class="metric__value ${t.saldo >= 0 ? 'metric__value--positivo' : 'metric__value--negativo'}">${brl(t.saldo)}</div>
      </div>
      <div class="metric__icon icon-verde">${ICON_CAIXA}</div>
    </div>
    ${metric('A receber (pendente)', brl(t.aReceber), ICON_RELOGIO, 'icon-amarelo')}
    ${metric('Litros transportados', numero(t.litros) + ' L', ICON_CAMINHAO, 'icon-coral')}

    <a href="#/frete" class="btn btn--primary btn--block" style="margin-top:var(--gap-lg)">+ Registrar novo frete</a>
  `;
}

export function mount() {
  ligarSeletorMesAno(() => {
    document.getElementById('app').innerHTML = render();
    mount();
  });
}
