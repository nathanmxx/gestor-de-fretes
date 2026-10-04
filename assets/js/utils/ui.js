/* ============================================================
   UI - pequenos auxiliares de interface reaproveitados nas telas.
   ============================================================ */

/** Escapa texto que vem do usuário antes de jogar no HTML (segurança). */
export function escapeHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Mostra um aviso rápido na parte de baixo da tela. */
export function toast(mensagem) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = mensagem;
  // força reflow pra animação reiniciar
  void el.offsetWidth;
  el.classList.add('is-show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('is-show'), 2200);
}

/** Navega pra uma rota (troca o # da URL). */
export function irPara(rota) {
  location.hash = rota;
}

/** Lê os parâmetros depois do "?" na rota atual. Ex: #/frete?id=abc */
export function paramsDaRota() {
  const partes = location.hash.split('?');
  return new URLSearchParams(partes[1] || '');
}
