/* ============================================================
   TELA: RESUMO — painel com os totais do mês.
   ============================================================ */

import { fretes, abastecimentos } from '../db.js';
import { kmRota } from '../config.js';
import { brl, numero } from '../utils/format.js';
import { calcularFrete } from '../models/frete.js';
import { depreciacaoDeKm } from '../models/depreciacao.js';
import { veiculoConfigurado } from '../settings.js';
import { filtro, seletorMesAnoHtml, ligarSeletorMesAno, noMesFiltro } from '../state.js';
import { ICON_UP, ICON_CIFRAO, ICON_CAIXA, ICON_RELOGIO, ICON_CAMINHAO, ICON_FERRAMENTA, ICON_VEICULO } from '../utils/icons.js';

/** Km de um frete: usa o km salvo; se não tiver, estima pela rota (ida e volta). */
function kmDoFrete(f) {
  if (Number(f.km) > 0) return Number(f.km);
  const r = kmRota(f.origem, f.destino);
  return r != null ? r : 0;
}

function calcularTotais() {
  const fre = fretes.listar().filter(noMesFiltro);
  const aba = abastecimentos.listar().filter(noMesFiltro);

  let receitas = 0, despesas = 0, litros = 0, aReceber = 0, somaKm = 0;
  for (const f of fre) {
    const valor = calcularFrete(f.litros, f.preco);
    receitas += valor;
    despesas += Number(f.despesas) || 0;
    litros += Number(f.litros) || 0;
    somaKm += kmDoFrete(f);
    if (!f.pago) aReceber += valor;
  }
  for (const a of aba) despesas += Number(a.valor) || 0;

  const saldo = receitas - despesas;
  const depreciacao = depreciacaoDeKm(somaKm);
  return {
    receitas, despesas, saldo, litros, aReceber, somaKm,
    depreciacao, lucroReal: saldo - depreciacao,
  };
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

function metricDestaque(label, valor, icone, classeIcone, classeValor) {
  return `
    <div class="metric metric--destaque">
      <div>
        <div class="metric__label">${label}</div>
        <div class="metric__value ${classeValor}">${valor}</div>
      </div>
      <div class="metric__icon ${classeIcone}">${icone}</div>
    </div>`;
}

export function render() {
  const t = calcularTotais();
  const configurado = veiculoConfigurado();
  const corSaldo = (v) => (v >= 0 ? 'metric__value--positivo' : 'metric__value--negativo');

  // Bloco de lucro: muda conforme o veículo estiver configurado ou não
  let blocoLucro;
  if (configurado) {
    blocoLucro = `
      ${metricDestaque('Lucro real', brl(t.lucroReal), ICON_CAIXA, 'icon-verde', corSaldo(t.lucroReal))}
      ${metric('Saldo operacional', brl(t.saldo), ICON_CAIXA, 'icon-verde', corSaldo(t.saldo))}
      ${metric('Depreciação estimada', '− ' + brl(t.depreciacao), ICON_FERRAMENTA, 'icon-amarelo')}
    `;
  } else {
    blocoLucro = `
      ${metricDestaque('Saldo (lucro)', brl(t.saldo), ICON_CAIXA, 'icon-verde', corSaldo(t.saldo))}
      <a href="#/veiculo" class="menu-item" style="margin-top:var(--gap-sm)">
        ${ICON_VEICULO}
        <span class="menu-item__txt">
          <strong>Calcule seu lucro real</strong>
          <small>Configure seu veículo pra descontar a depreciação</small>
        </span>
      </a>
    `;
  }

  return `
    <h1 class="page-title">Resumo</h1>
    ${seletorMesAnoHtml()}

    <div class="metric-row">
      ${metric('Receitas', brl(t.receitas), ICON_UP, 'icon-verde')}
      ${metric('Despesas', brl(t.despesas), ICON_CIFRAO, 'icon-negativo')}
    </div>

    ${blocoLucro}

    <div class="section-title">Operacional</div>
    ${metric('A receber (pendente)', brl(t.aReceber), ICON_RELOGIO, 'icon-amarelo')}
    ${metric('Litros transportados', numero(t.litros) + ' L', ICON_CAMINHAO, 'icon-coral')}
    ${metric('Km rodados (estimado)', numero(t.somaKm) + ' km', ICON_CAMINHAO, 'icon-coral')}

    <a href="#/frete" class="btn btn--primary btn--block" style="margin-top:var(--gap-lg)">+ Registrar novo frete</a>
  `;
}

export function mount() {
  ligarSeletorMesAno(() => {
    document.getElementById('app').innerHTML = render();
    mount();
  });
}
