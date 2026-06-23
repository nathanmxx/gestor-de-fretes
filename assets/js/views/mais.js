/* ============================================================
   TELA: MAIS — menu com as opções extras (abastecimento, backup).
   ============================================================ */

import { ICON_FUEL, ICON_DOWNLOAD, ICON_CAIXA } from '../utils/icons.js';

function item(rota, icone, titulo, descricao) {
  return `
    <a class="menu-item" href="${rota}">
      ${icone}
      <span class="menu-item__txt">
        <strong>${titulo}</strong>
        <small>${descricao}</small>
      </span>
    </a>`;
}

export function render() {
  return `
    <h1 class="page-title">Mais</h1>
    ${item('#/abastecimento', ICON_FUEL, 'Abastecimentos', 'Combustível e média de consumo')}
    ${item('#/backup', ICON_DOWNLOAD, 'Backup dos dados', 'Exportar / importar planilha (.csv)')}

    <div class="section-title">Sobre</div>
    <div class="metric">
      <div>
        <div class="metric__label">Gestor de Fretes</div>
        <div class="metric__value" style="font-size:1.1rem">Versão 1.0</div>
      </div>
      <div class="metric__icon icon-coral">${ICON_CAIXA}</div>
    </div>
    <p style="color:var(--text-faint);font-size:0.85rem;margin-top:var(--gap);text-align:center">
      Seus dados ficam salvos neste aparelho/navegador.<br>
      Faça backup de vez em quando pela tela acima.
    </p>
  `;
}
