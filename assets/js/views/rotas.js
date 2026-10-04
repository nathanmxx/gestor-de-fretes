/* ============================================================
   TELA: MINHAS ROTAS - cadastro das rotas, preços por litro e km.
   É aqui que o motorista coloca quanto cobra em cada trajeto.
   ============================================================ */

import { listarRotas, salvarRota, removerRota, rotasConfiguradas } from '../rotas.js';
import { toast, escapeHtml } from '../utils/ui.js';

function linhaRota(r) {
  const precoTxt = 'R$ ' + r.preco.toFixed(2).replace('.', ',') + ' /litro';
  const kmTxt = r.km ? r.km + ' km (só ida)' : 'sem km cadastrado';
  return `
    <div class="metric">
      <div>
        <div class="metric__label">${escapeHtml(r.origem)} para ${escapeHtml(r.destino)}</div>
        <div class="metric__value" style="font-size:1.1rem">${precoTxt}</div>
        <small style="color:var(--text-faint)">${kmTxt}</small>
      </div>
      <button class="btn btn--ghost btn--apagar-rota"
              data-origem="${escapeHtml(r.origem)}"
              data-destino="${escapeHtml(r.destino)}">Apagar</button>
    </div>`;
}

export function render() {
  const rotas = listarRotas();
  const usandoExemplo = !rotasConfiguradas();

  return `
    <h1 class="page-title">Minhas Rotas</h1>

    ${usandoExemplo ? `
      <p style="color:var(--text-soft);margin-bottom:var(--gap-lg)">
        Estas são rotas de exemplo. Cadastre as suas abaixo que elas somem
        e o app passa a usar os seus preços.
      </p>` : `
      <p style="color:var(--text-soft);margin-bottom:var(--gap-lg)">
        O preço por litro de cada rota. O app usa estes valores para calcular
        o frete automaticamente.
      </p>`}

    <div class="section-title">Rotas cadastradas</div>
    ${rotas.length ? rotas.map(linhaRota).join('') : '<p>Nenhuma rota ainda.</p>'}

    <div class="section-title">Adicionar ou alterar rota</div>
    <form class="form" id="form-rota" novalidate>
      <div class="field" id="campo-origem">
        <label class="field__label" for="r-origem">Saindo de</label>
        <input class="input" type="text" id="r-origem" placeholder="Ex: nome da cidade" />
        <small class="field__erro"></small>
      </div>

      <div class="field" id="campo-destino">
        <label class="field__label" for="r-destino">Indo para</label>
        <input class="input" type="text" id="r-destino" placeholder="Ex: nome do destino" />
        <small class="field__erro"></small>
      </div>

      <div class="field" id="campo-preco">
        <label class="field__label" for="r-preco">Preço por litro (R$)</label>
        <input class="input" type="number" id="r-preco" inputmode="decimal" min="0" step="0.01" placeholder="Ex: 0,10" />
        <small class="field__erro"></small>
      </div>

      <div class="field">
        <label class="field__label" for="r-km">Distância só de ida (km) <span class="field__hint">(opcional)</span></label>
        <input class="input" type="number" id="r-km" inputmode="numeric" min="0" placeholder="Ex: 110" />
      </div>

      <button type="submit" class="btn btn--primary btn--block">Salvar rota</button>
      <a href="#/mais" class="btn btn--ghost btn--block">Voltar</a>
    </form>

    <p style="color:var(--text-faint);font-size:0.85rem;margin-top:var(--gap);text-align:center">
      Se cadastrar uma origem e um destino que já existem, o preço é atualizado.
    </p>
  `;
}

export function mount() {
  const form = document.getElementById('form-rota');
  if (!form) return;

  // Apagar rota
  document.querySelectorAll('.btn--apagar-rota').forEach((btn) => {
    btn.addEventListener('click', () => {
      removerRota(btn.dataset.origem, btn.dataset.destino);
      toast('Rota apagada.');
      // redesenha a tela
      const app = document.getElementById('app');
      app.innerHTML = render();
      mount();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const origem = document.getElementById('r-origem').value.trim();
    const destino = document.getElementById('r-destino').value.trim();
    const preco = document.getElementById('r-preco').value;
    const km = document.getElementById('r-km').value;

    // limpa erros antigos
    ['origem', 'destino', 'preco'].forEach((c) => {
      const campo = document.getElementById('campo-' + c);
      campo?.classList.remove('field--erro');
      const msg = campo?.querySelector('.field__erro');
      if (msg) msg.textContent = '';
    });

    const erros = {};
    if (!origem) erros.origem = 'Informe a cidade de origem.';
    if (!destino) erros.destino = 'Informe o destino.';
    if (!preco || Number(preco) <= 0) erros.preco = 'Informe o preço por litro (maior que zero).';

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

    salvarRota({ origem, destino, preco, km });
    toast('Rota salva!');

    const app = document.getElementById('app');
    app.innerHTML = render();
    mount();
  });
}
