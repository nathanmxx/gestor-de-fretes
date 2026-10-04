/* ============================================================
   MODELO FRETE - as "contas" do frete num lugar só.
   Manter o cálculo aqui (e não espalhado nas telas) garante que
   o app inteiro calcula igual, sem divergência.
   ============================================================ */

/** Arredonda pra 2 casas decimais sem erro de ponto flutuante. */
function duasCasas(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/** Frete = litros transportados × preço por litro. */
export function calcularFrete(litros, precoLitro) {
  return duasCasas((Number(litros) || 0) * (Number(precoLitro) || 0));
}

/** Lucro = valor do frete − despesas da viagem. */
export function calcularLucro(valorFrete, despesas) {
  return duasCasas((Number(valorFrete) || 0) - (Number(despesas) || 0));
}

/**
 * Valida os dados de um frete antes de salvar.
 * Devolve um objeto de erros { campo: 'mensagem' }.
 * Se estiver vazio, está tudo certo.
 */
export function validarFrete({ data, origem, destino, litros }) {
  const erros = {};
  if (!data) erros.data = 'Informe a data.';
  if (!origem) erros.origem = 'Escolha a cidade de origem.';
  if (!destino) erros.destino = 'Escolha o destino.';
  if (!litros || Number(litros) <= 0) erros.litros = 'Informe quantos litros (maior que zero).';
  return erros;
}
