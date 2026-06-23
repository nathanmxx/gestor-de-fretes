/* ============================================================
   APP — ponto de entrada e "roteador".
   Olha o # da URL e decide qual tela desenhar dentro de <main id="app">.
   ============================================================ */

import * as resumo from './views/resumo.js';
import * as fretes from './views/fretes.js';
import * as frete from './views/frete.js';
import * as receber from './views/receber.js';
import * as abastecimento from './views/abastecimento.js';
import * as mais from './views/mais.js';
import * as backup from './views/backup.js';

// rota -> módulo da tela
const ROTAS = {
  '/resumo': resumo,
  '/fretes': fretes,
  '/frete': frete,
  '/receber': receber,
  '/abastecimento': abastecimento,
  '/mais': mais,
  '/backup': backup,
};

// rota -> qual aba da barra de baixo fica acesa
const ABA_DA_ROTA = {
  '/resumo': 'resumo',
  '/fretes': 'fretes',
  '/frete': 'frete',
  '/receber': 'receber',
  '/abastecimento': 'mais',
  '/mais': 'mais',
  '/backup': 'mais',
};

function navegar() {
  const hash = location.hash.slice(1) || '/resumo';
  const caminho = hash.split('?')[0];
  const tela = ROTAS[caminho] || resumo;

  const app = document.getElementById('app');
  app.innerHTML = tela.render();
  if (typeof tela.mount === 'function') tela.mount();

  // acende a aba correspondente
  const abaAtiva = ABA_DA_ROTA[caminho] || 'resumo';
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.tab === abaAtiva);
  });

  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', navegar);
navegar(); // desenha a primeira tela ao abrir
