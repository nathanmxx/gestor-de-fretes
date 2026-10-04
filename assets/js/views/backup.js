/* ============================================================
   TELA: BACKUP - exportar, importar e apagar os dados.
   O export gera um .csv que também abre no Excel (igual planilha).
   ============================================================ */

import { fretes } from '../db.js';
import { baixarCsv, csvParaFretes } from '../utils/csv.js';
import { toast } from '../utils/ui.js';
import { ICON_DOWNLOAD, ICON_UPLOAD, ICON_LIXEIRA } from '../utils/icons.js';

export function render() {
  const total = fretes.listar().length;
  return `
    <h1 class="page-title">Backup</h1>

    <p style="color:var(--text-soft);margin-bottom:var(--gap-lg)">
      Você tem <strong>${total}</strong> frete(s) salvos neste aparelho.
      Exporte de vez em quando pra não perder nada se trocar de celular ou limpar o navegador.
    </p>

    <button class="menu-item" id="btn-exportar">
      ${ICON_DOWNLOAD}
      <span class="menu-item__txt">
        <strong>Exportar planilha (.csv)</strong>
        <small>Baixa todos os fretes - abre no Excel</small>
      </span>
    </button>

    <label class="menu-item" for="input-importar" style="cursor:pointer">
      ${ICON_UPLOAD}
      <span class="menu-item__txt">
        <strong>Importar planilha (.csv)</strong>
        <small>Substitui os dados atuais pelos do arquivo</small>
      </span>
    </label>
    <input type="file" id="input-importar" accept=".csv,text/csv" hidden />

    <div class="section-title">Zona de risco</div>
    <button class="menu-item" id="btn-apagar" style="color:var(--negativo)">
      ${ICON_LIXEIRA}
      <span class="menu-item__txt">
        <strong>Apagar todos os fretes</strong>
        <small>Remove tudo deste aparelho (não dá pra desfazer)</small>
      </span>
    </button>
  `;
}

export function mount() {
  document.getElementById('btn-exportar')?.addEventListener('click', () => {
    const lista = fretes.listar();
    if (!lista.length) { toast('Não há fretes pra exportar.'); return; }
    baixarCsv(lista);
    toast('Arquivo .csv gerado!');
  });

  document.getElementById('input-importar')?.addEventListener('change', (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const importados = csvParaFretes(String(leitor.result));
        if (!importados.length) { toast('Nenhum frete encontrado no arquivo.'); return; }
        if (confirm(`Importar ${importados.length} frete(s)? Isso substitui os dados atuais.`)) {
          fretes.substituirTudo(importados.map((f) => ({ ...f, id: undefined })).map((f) => ({
            ...f,
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          })));
          toast('Dados importados!');
          location.hash = '#/fretes';
        }
      } catch (err) {
        console.error(err);
        toast('Não consegui ler esse arquivo.');
      }
    };
    leitor.readAsText(arquivo, 'utf-8');
    e.target.value = ''; // permite reimportar o mesmo arquivo depois
  });

  document.getElementById('btn-apagar')?.addEventListener('click', () => {
    if (confirm('APAGAR TODOS os fretes deste aparelho? Não dá pra desfazer.')) {
      fretes.substituirTudo([]);
      toast('Todos os fretes foram apagados.');
      location.hash = '#/resumo';
    }
  });
}
