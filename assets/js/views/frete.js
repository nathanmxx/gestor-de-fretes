/* ============================================================
   TELA: FRETE — formulário de novo frete (ou edição).
   É o coração do app: preço, frete e lucro são calculados
   automaticamente pra evitar erro de digitação.
   ============================================================ */

import { ORIGENS, DESTINOS, precoPorLitro } from '../config.js';
import { fretes } from '../db.js';
import { hojeIso, brl } from '../utils/format.js';
import { calcularFrete, calcularLucro, validarFrete } from '../models/frete.js';
import { toast, irPara, paramsDaRota, escapeHtml } from '../utils/ui.js';

let editId = null;

function precoTexto(preco) {
  return 'R$ ' + String(preco).replace('.', ',') + ' /litro';
}

export function render() {
  editId = paramsDaRota().get('id');
  const f = editId ? fretes.pegar(editId) : null;

  const opcoesOrigem = ORIGENS
    .map((o) => `<option value="${o}" ${f?.origem === o ? 'selected' : ''}>${o}</option>`).join('');
  const opcoesDestino = DESTINOS
    .map((d) => `<option value="${d}" ${f?.destino === d ? 'selected' : ''}>${d}</option>`).join('');

  return `
    <h1 class="page-title">${editId ? 'Editar Frete' : 'Novo Frete'}</h1>
    <form class="form" id="form-frete" novalidate>

      <div class="field" id="campo-data">
        <label class="field__label" for="data">Data</label>
        <input class="input" type="date" id="data" value="${f?.data || hojeIso()}" />
        <small class="field__erro"></small>
      </div>

      <div class="field" id="campo-origem">
        <label class="field__label" for="origem">Saindo de (origem)</label>
        <select class="select" id="origem">
          <option value="">Escolha a cidade...</option>
          ${opcoesOrigem}
        </select>
        <small class="field__erro"></small>
      </div>

      <div class="field" id="campo-destino">
        <label class="field__label" for="destino">Indo para (destino)</label>
        <select class="select" id="destino">
          <option value="">Escolha o destino...</option>
          ${opcoesDestino}
        </select>
        <small class="field__erro"></small>
      </div>

      <div class="field">
        <label class="field__label" for="cliente">Cliente <span class="field__hint">(opcional)</span></label>
        <input class="input" type="text" id="cliente" value="${escapeHtml(f?.cliente || '')}" placeholder="Ex: nome do cliente" />
      </div>

      <div class="field" id="campo-litros">
        <label class="field__label" for="litros">Litros transportados</label>
        <input class="input" type="number" id="litros" inputmode="numeric" min="0" value="${f?.litros ?? ''}" placeholder="Ex: 30000" />
        <small class="field__erro"></small>
      </div>

      <div class="field">
        <label class="field__label" for="despesas">Despesas da viagem <span class="field__hint">(pedágio, etc.)</span></label>
        <input class="input" type="number" id="despesas" inputmode="decimal" min="0" step="0.01" value="${f?.despesas ?? ''}" placeholder="Ex: 1400,00" />
      </div>

      <!-- Tudo aqui é calculado sozinho -->
      <div class="calc-box">
        <div class="calc-row"><span>Preço por litro (pela rota)</span><strong id="out-preco">—</strong></div>
        <div class="calc-row"><span>Valor do frete</span><strong id="out-frete">—</strong></div>
        <div class="calc-row calc-row--total"><span>Lucro</span><strong id="out-lucro">—</strong></div>
      </div>

      <div class="field">
        <label class="field__label">Situação do pagamento</label>
        <div class="switch-pago">
          <input type="radio" name="pago" id="pago-sim" value="sim" ${f?.pago ? 'checked' : ''}>
          <label for="pago-sim">✓ Pago</label>
          <input type="radio" name="pago" id="pago-nao" value="nao" ${!f?.pago ? 'checked' : ''}>
          <label for="pago-nao">⏳ Pendente</label>
        </div>
      </div>

      <button type="submit" class="btn btn--primary btn--block">${editId ? 'Salvar alterações' : 'Registrar frete'}</button>
      <a href="#/fretes" class="btn btn--ghost btn--block">Cancelar</a>
    </form>
  `;
}

export function mount() {
  const form = document.getElementById('form-frete');
  if (!form) return;

  const origem = document.getElementById('origem');
  const destino = document.getElementById('destino');
  const litros = document.getElementById('litros');
  const despesas = document.getElementById('despesas');
  const outPreco = document.getElementById('out-preco');
  const outFrete = document.getElementById('out-frete');
  const outLucro = document.getElementById('out-lucro');

  function recalcular() {
    const preco = precoPorLitro(origem.value, destino.value);
    if (preco == null) {
      outPreco.textContent = outFrete.textContent = outLucro.textContent = '—';
      return;
    }
    const valorFrete = calcularFrete(litros.value, preco);
    outPreco.textContent = precoTexto(preco);
    outFrete.textContent = brl(valorFrete);
    outLucro.textContent = brl(calcularLucro(valorFrete, despesas.value));
  }

  [origem, destino, litros, despesas].forEach((el) => {
    el.addEventListener('input', recalcular);
    el.addEventListener('change', recalcular);
  });
  recalcular();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dados = {
      data: document.getElementById('data').value,
      origem: origem.value,
      destino: destino.value,
      cliente: document.getElementById('cliente').value.trim(),
      litros: Number(litros.value),
      despesas: Number(despesas.value) || 0,
      pago: document.getElementById('pago-sim').checked,
      preco: precoPorLitro(origem.value, destino.value) || 0,
    };

    // limpa erros antigos
    ['data', 'origem', 'destino', 'litros'].forEach((c) => {
      const campo = document.getElementById('campo-' + c);
      campo?.classList.remove('field--erro');
      const msg = campo?.querySelector('.field__erro');
      if (msg) msg.textContent = '';
    });

    const erros = validarFrete(dados);
    if (Object.keys(erros).length > 0) {
      for (const [nome, mensagem] of Object.entries(erros)) {
        const campo = document.getElementById('campo-' + nome);
        campo?.classList.add('field--erro');
        const msg = campo?.querySelector('.field__erro');
        if (msg) msg.textContent = mensagem;
      }
      toast('Confira os campos destacados.');
      return;
    }

    if (editId) {
      fretes.atualizar(editId, dados);
      toast('Frete atualizado!');
    } else {
      fretes.adicionar(dados);
      toast('Frete registrado!');
    }
    irPara('/fretes');
  });
}
