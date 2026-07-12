/* ============================================================
   TELA: MEU VEÍCULO — dados do caminhão e dos pneus (1 vez só).
   Servem para estimar a depreciação (desgaste) por km.
   ============================================================ */

import { lerVeiculo, salvarVeiculo } from '../settings.js';
import { brl } from '../utils/format.js';
import { custoVeiculoPorKm, custoPneusPorKm, desgastePorKm } from '../models/depreciacao.js';
import { toast, irPara } from '../utils/ui.js';

function precoKm(valor) {
  // mostra com 3 casas porque é centavo por km (ex: R$ 0,350/km)
  return 'R$ ' + (Number(valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' /km';
}

export function render() {
  const v = lerVeiculo();
  return `
    <h1 class="page-title">Meu Veículo</h1>
    <p style="color:var(--text-soft);margin-bottom:var(--gap-lg)">
      Preencha uma vez. Com isso o app calcula o <strong>desgaste por km</strong>
      do caminhão e dos pneus, e mostra seu <strong>lucro real</strong> no Resumo.
    </p>

    <form class="form" id="form-veiculo" novalidate>
      <div class="section-title" style="margin-top:0">Caminhão</div>

      <div class="field">
        <label class="field__label" for="valorCompra">Valor de compra (ou valor atual)</label>
        <input class="input" type="number" id="valorCompra" inputmode="decimal" min="0" step="0.01" value="${v.valorCompra || ''}" placeholder="Ex: 300000" />
      </div>
      <div class="field">
        <label class="field__label" for="valorRevenda">Valor de revenda estimado <span class="field__hint">(quanto espera vender depois)</span></label>
        <input class="input" type="number" id="valorRevenda" inputmode="decimal" min="0" step="0.01" value="${v.valorRevenda || ''}" placeholder="Ex: 100000" />
      </div>
      <div class="field">
        <label class="field__label" for="vidaUtilKm">Vida útil estimada (km)</label>
        <input class="input" type="number" id="vidaUtilKm" inputmode="numeric" min="0" value="${v.vidaUtilKm || ''}" placeholder="Ex: 1000000" />
      </div>

      <div class="section-title">Pneus</div>

      <div class="field">
        <label class="field__label" for="precoJogoPneus">Preço do jogo completo de pneus</label>
        <input class="input" type="number" id="precoJogoPneus" inputmode="decimal" min="0" step="0.01" value="${v.precoJogoPneus || ''}" placeholder="Ex: 12000" />
      </div>
      <div class="field">
        <label class="field__label" for="vidaUtilPneusKm">Quantos km um jogo dura</label>
        <input class="input" type="number" id="vidaUtilPneusKm" inputmode="numeric" min="0" value="${v.vidaUtilPneusKm || ''}" placeholder="Ex: 80000" />
      </div>

      <!-- Resultado calculado ao vivo -->
      <div class="calc-box">
        <div class="calc-row"><span>Desgaste do caminhão</span><strong id="out-veiculo">—</strong></div>
        <div class="calc-row"><span>Desgaste dos pneus</span><strong id="out-pneus">—</strong></div>
        <div class="calc-row calc-row--total"><span>Desgaste total por km</span><strong id="out-total">—</strong></div>
      </div>

      <button type="submit" class="btn btn--primary btn--block">Salvar dados do veículo</button>
      <a href="#/mais" class="btn btn--ghost btn--block">Voltar</a>
    </form>
  `;
}

export function mount() {
  const form = document.getElementById('form-veiculo');
  if (!form) return;

  const campos = ['valorCompra', 'valorRevenda', 'vidaUtilKm', 'precoJogoPneus', 'vidaUtilPneusKm'];

  function lerForm() {
    const obj = {};
    for (const c of campos) obj[c] = Number(document.getElementById(c).value) || 0;
    return obj;
  }

  function recalcular() {
    const v = lerForm();
    document.getElementById('out-veiculo').textContent = precoKm(custoVeiculoPorKm(v));
    document.getElementById('out-pneus').textContent = precoKm(custoPneusPorKm(v));
    document.getElementById('out-total').textContent = precoKm(desgastePorKm(v));
  }

  campos.forEach((c) => {
    const el = document.getElementById(c);
    el.addEventListener('input', recalcular);
    el.addEventListener('change', recalcular);
  });
  recalcular();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    salvarVeiculo(lerForm());
    toast('Dados do veículo salvos!');
    irPara('/resumo');
  });
}
