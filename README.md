# Gestor de Fretes

Aplicação web para quem gerencia fretados e entregas de caminhão controlar viagens, ganhos e gastos. O app calcula o valor do frete, o saldo do mês e o desgaste do veículo.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML, CSS e JavaScript (ES Modules) |
| Dados | localStorage do navegador |
| Backup | CSV, abre no Excel |
| Deploy | Vercel (site estático) |

Não tem backend, banco de dados nem etapa de build. Tudo roda no navegador e os dados ficam salvos no próprio aparelho. O backup em `.csv` serve para não perder nada se o usuário trocar de celular.

## O que o projeto faz

1. Tela de registro de frete: o usuário escolhe origem, destino e informa quantos litros levou.
2. O app pega o preço por litro da rota e calcula o valor do frete e o lucro, sem conta manual.
3. O frete é salvo como Pago ou Pendente e aparece na tela "Meus Fretes".
4. A tela Resumo junta os dados do mês: receitas, despesas, saldo, litros e km.
5. Com o veículo configurado, calcula o desgaste por km e mostra o lucro real já descontando esse custo.
6. Exporta tudo para `.csv` e importa de volta.

## Regra de negócio

### Como o frete é cobrado

O valor não é fixo por viagem. Depende de quantos litros foram transportados e de qual é a rota, porque cada rota tem um preço por litro próprio.

```
FRETE = LITROS x PRECO_POR_LITRO_DA_ROTA
LUCRO = FRETE - DESPESAS
```

Exemplo com 20.000 litros numa rota de R$ 0,10 por litro e R$ 1.000 de despesas:

```
Frete = 20.000 x 0,10 = R$ 2.000,00
Lucro = 2.000 - 1.000 = R$ 1.000,00
```

### Tabela de preços

Os preços não ficam no código. Cada motorista cadastra as rotas dele na tela "Minhas Rotas", informando origem, destino, preço por litro e distância. Isso fica salvo no localStorage do aparelho.

Fiz dessa forma por dois motivos: cada motorista cobra um valor diferente, então um preço fixo no código não serviria para ninguém além de uma pessoa; e preço é informação do negócio de quem usa, não deveria estar num repositório público.

Enquanto o usuário não cadastra nada, o app mostra três rotas de exemplo com valores fictícios (`ROTAS_EXEMPLO` em `assets/js/rotas.js`). Assim que a primeira rota real é salva, os exemplos somem.

### Situação do pagamento

Cada frete fica como Pago ou Pendente. Os pendentes aparecem na tela "A Receber", com o total que ainda falta receber.

### Desgaste por km

É o custo que não aparece na hora: o caminhão e os pneus vão se gastando conforme rodam. O cálculo é linear por km.

```
Desgaste veiculo/km = (valor_compra - valor_revenda) / vida_util_km
Desgaste pneus/km   = preco_do_jogo / vida_util_dos_pneus_km
Desgaste total/km   = veiculo/km + pneus/km
Depreciacao         = desgaste_total/km x km_rodados
Lucro real          = saldo - depreciacao
```

Por padrão o app considera ida e volta, porque o caminhão se desgasta nos dois sentidos mesmo voltando vazio. Cada frete tem um km preenchido automático pela rota, mas dá para editar. Os dados do veículo e dos pneus são informados uma vez só, na tela "Meu Veículo".

## Funcionalidades

| Tela | O que faz |
|------|-----------|
| Resumo | Painel do mês: receitas, despesas, saldo, a receber, litros e km. Mostra o desgaste e o lucro real quando o veículo está configurado. Tem filtro por mês e ano. |
| Meus Fretes | Lista os fretes do mês com status Pago ou Pendente. Dá para editar e excluir. |
| Novo Frete | Formulário com cálculo automático de preço, frete, lucro e desgaste. Valida os campos antes de salvar. |
| A Receber | Lista os fretes pendentes de qualquer mês e o total a receber. Tem botão "Marcar pago". |
| Minhas Rotas | Cadastro das rotas com preço por litro e km. É daqui que sai o cálculo automático do frete. |
| Meu Veículo | Dados do caminhão e dos pneus. É a base do cálculo de desgaste. |
| Abastecimentos | Registra combustível com litros, valor e km do painel. Calcula a média de consumo em km/L. |
| Backup | Exporta os fretes para `.csv` e importa de volta. Também permite apagar todos os dados. |

## Arquitetura

O código é separado em camadas e cada camada só conhece a de baixo. Fiz assim para os cálculos ficarem num lugar só, em vez de repetidos dentro de cada tela.

```
VIEWS (telas)        resumo, fretes, frete, receber, veiculo...
    desenham o HTML e tratam os cliques
ROUTER (app.js)
    decide qual tela mostrar pelo hash da URL
MODELS / STATE / UTILS
    calculos, filtro de mes, formatacao
DB (db.js) / ROTAS (rotas.js)
    colecoes de fretes e abastecimentos (CRUD) e as rotas cadastradas
STORAGE (storage.js)
    le e grava no localStorage com tratamento de erro
```

Como não tem servidor, o `storage.js` é o único arquivo que fala com o localStorage. Ele usa `try/catch` para que um erro de leitura não trave o app inteiro.

### Fluxo para registrar um frete

```
1. Usuario preenche o formulario   (views/frete.js)
2. validarFrete() e calcularFrete() (models/frete.js)
3. fretes.adicionar()              (db.js)
4. save()                          (storage.js -> localStorage)
5. Router vai para "Meus Fretes" e redesenha a lista
```

### Padrão das views

Toda tela exporta duas funções:

- `render()` devolve o HTML da tela como string.
- `mount()` roda depois que o HTML entra na página e liga os event listeners.

```js
export function render() {
  return `<h1 class="page-title">Minha Tela</h1>`;
}

export function mount() {
  document.getElementById('meu-botao')
    ?.addEventListener('click', () => { /* ... */ });
}
```

## Estrutura do repositório

```
gestor-de-fretes/
  index.html                 pagina unica, carrega o CSS e o app.js
  README.md
  .gitignore
  assets/
    css/
      variables.css          cores, espacamentos e fontes
      base.css               reset e layout geral
      components.css         cartoes, formularios, botoes e listas
    js/
      app.js                 router: le o hash da URL e desenha a tela
      rotas.js               rotas do motorista (preco por litro e km)
      storage.js             ler e gravar no localStorage
      db.js                  colecoes de fretes e abastecimentos
      state.js               filtro de mes e ano
      settings.js            configuracao do veiculo e dos pneus
      models/
        frete.js             calculo de frete e lucro, validacao
        depreciacao.js       desgaste linear por km
      utils/
        format.js            formatar moeda, numeros e datas
        csv.js               exportar e importar .csv
        icons.js             icones SVG
        ui.js                toast, escapeHtml e navegacao
      views/
        resumo.js
        fretes.js
        frete.js
        receber.js
        rotas.js
        veiculo.js
        abastecimento.js
        mais.js
        backup.js
```

## Decisões técnicas

### Por que sem framework

Escolhi HTML, CSS e JavaScript puro porque eu queria entender cada linha do que estava escrevendo. React ou Vue iam adicionar complexidade sem ganho real num projeto desse tamanho, e qualquer dependência extra significaria uma etapa de build para fazer o deploy.

Os ES Modules do próprio JavaScript já resolvem a organização em arquivos com `import` e `export`, sem precisar de bundler.

### Por que localStorage

Não precisava de servidor. O motorista usa no próprio celular, os dados ficam salvos lá e funciona sem internet. A desvantagem é que os dados ficam presos naquele aparelho, e é por isso que existe o backup em CSV.

### Por que CSV no backup

Porque o Excel é um programa que o público-alvo já conhece. Se um dia a pessoa parar de usar o app, os dados continuam abríveis.

### Ferramentas

| Ferramenta | Para que serve |
|-----------|-------------|
| Git | Histórico do projeto e possibilidade de reverter mudanças. |
| GitHub | Backup do código e integração com a Vercel. |
| Vercel | Deploy gratuito, atualiza sozinho a cada push. |

## Como executar localmente

Precisa ter Python 3 instalado.

O projeto usa ES Modules, e o navegador bloqueia esses arquivos quando a página é aberta com duplo clique. Por isso é preciso subir um servidor local:

```bash
python -m http.server 8000
```

Depois é só abrir `http://localhost:8000`. Para parar o servidor, `Ctrl + C`.

## Deploy

Hospedado na Vercel como site estático. Atualiza sozinho a cada push na branch `main`. Não tem etapa de build nem variável de ambiente.

## Sobre o projeto

O app é voltado para gerentes de fretados e de entregas de caminhão, uma área que tem pouca ferramenta feita sob medida. Quem trabalha nesse setor costuma acabar numa planilha ou num caderno, porque os aplicativos de entrega que existem são pensados em "pedido" e "coleta".

Esses conceitos não servem para quem cobra por litro transportado, com preço fixo por rota. É uma forma de cobrança comum no transporte de combustível e de carga a granel, e nenhum app genérico dá conta dela.

A ideia foi partir daí: montar um sistema que siga a lógica de cobrança que o setor já usa, em vez de obrigar a pessoa a adaptar o trabalho dela ao programa. O cálculo do frete, do lucro e do desgaste do veículo sai automático a partir da rota e dos litros, que são os dois números que o gestor já tem na mão.

Tinha uma versão anterior desse sistema que travava na hora de registrar uma viagem, por causa de um erro de JavaScript que não era tratado. Refiz do zero com dois objetivos: seguir a lógica que o setor já usa e não travar.

## Licença

MIT
