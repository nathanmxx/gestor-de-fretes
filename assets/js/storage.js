/* ============================================================
   STORAGE — camada de acesso ao localStorage do navegador.
   É a única parte do código que fala diretamente com o navegador
   pra ler/gravar dados. Todo o resto usa o db.js (mais acima).
   ============================================================ */

const PREFIX = 'gdf:'; // "gestor de fretes" — evita conflito com outros sites

/**
 * Lê uma chave do localStorage e devolve o valor (objeto/lista).
 * Se der qualquer erro (dado corrompido, etc.), devolve o fallback
 * em vez de quebrar o app — foi isso que dava o "código bizarro" antes.
 */
export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error('[storage] falha ao ler', key, err);
    return fallback;
  }
}

/**
 * Grava um valor (será convertido pra texto JSON).
 * Retorna true/false indicando se conseguiu salvar.
 */
export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('[storage] falha ao salvar', key, err);
    return false;
  }
}

/** Gera um identificador único simples pra cada registro. */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
