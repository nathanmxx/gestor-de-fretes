/* ============================================================
   DB — "banco de dados" local em cima do storage.
   Cria coleções (fretes, abastecimentos) com as operações
   básicas: listar, pegar um, adicionar, atualizar, remover.
   O resto do app conversa só com isto, nunca com o localStorage direto.
   ============================================================ */

import { load, save, uid } from './storage.js';

function criarColecao(chave) {
  return {
    /** Lista todos os registros. */
    listar() {
      return load(chave, []);
    },

    /** Pega um registro pelo id. */
    pegar(id) {
      return this.listar().find((item) => item.id === id) || null;
    },

    /** Adiciona um novo registro (gera id automático). */
    adicionar(dados) {
      const itens = this.listar();
      const novo = { ...dados, id: uid(), criadoEm: new Date().toISOString() };
      itens.push(novo);
      save(chave, itens);
      return novo;
    },

    /** Atualiza um registro existente; devolve o atualizado ou null. */
    atualizar(id, mudancas) {
      const itens = this.listar();
      const i = itens.findIndex((item) => item.id === id);
      if (i === -1) return null;
      itens[i] = { ...itens[i], ...mudancas };
      save(chave, itens);
      return itens[i];
    },

    /** Remove um registro pelo id. */
    remover(id) {
      const itens = this.listar().filter((item) => item.id !== id);
      save(chave, itens);
    },

    /** Substitui a coleção inteira (usado na importação de backup). */
    substituirTudo(itens) {
      save(chave, Array.isArray(itens) ? itens : []);
    },
  };
}

export const fretes = criarColecao('fretes');
export const abastecimentos = criarColecao('abastecimentos');
