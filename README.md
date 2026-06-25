# 🚚 Gestor de Fretes

> Aplicação web para motoristas de caminhão PJ controlarem fretes, ganhos e gastos — com cálculo automático de preço, saldo e depreciação do veículo.

**Repositório:** [github.com/nathanmxx/gestor-de-fretes](https://github.com/nathanmxx/gestor-de-fretes)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML · CSS · JavaScript (ES Modules) |
| Dados | `localStorage` do navegador |
| Backup | CSV — compatível com Excel |
| Deploy | Vercel (site estático) |

Sem backend, sem banco de dados, sem etapa de build. Todo o processamento ocorre no navegador. Os dados ficam salvos localmente; o backup em `.csv` serve como mecanismo de portabilidade e segurança.

---

## O que o projeto faz

1. Exibe um formulário de registro de frete: o usuário escolhe origem, destino e informa os litros transportados.
2. Calcula automaticamente o preço por litro da rota, o valor do frete e o lucro estimado — sem nenhuma conta manual.
3. Salva o frete como **Pago** ou **Pendente** e o lista na tela "Meus Fretes".
4. Consolida os dados do mês no **Resumo**: receitas, despesas, saldo, litros e km rodados.
5. Quando o veículo está configurado, calcula a **depreciação por km** e exibe o **lucro real** descontando o desgaste do caminhão e dos pneus.
6. Exporta todos os fretes para `.csv` (abre no Excel) e permite importar de volta.

---

## Regra de Negócio

### Como o frete é cobrado

O valor não é fixo por viagem: depende de **quantos litros** são transportados e de **qual a rota**. Cada rota tem um preço por litro fixo.

```
FRETE = LITROS × PREÇO_POR_LITRO_DA_ROTA
LUCRO = FRETE − DESPESAS
```

**Exemplo:** Cidade A → Destino 2, 30.000 litros, despesas R$ 1.400
```
Preço da rota = R$ 0,15 / litro
Frete = 30.000 × 0,15 = R$ 3.900,00
Lucro = 3.900 − 1.400 = R$ 2.500,00
```

### Tabela de preços (R$ por litro)

| Origem | → Destino 1 | → Destino 2 |
|--------|:---:|:---:|
| Cidade A | 0,10 | 0,15 |
| Cidade B | 0,25 | 0,30 |
| Cidade C | 0,35 | 0,40 |

> Para alterar os preços ou adicionar rotas, edite `assets/js/config.js` — o app inteiro passa a usar o valor novo.

### Situação do pagamento

Cada frete é **Pago** ou **Pendente**. Os pendentes alimentam a tela "A Receber", que mostra o total ainda a receber.

### Depreciação (desgaste por km)

O "custo invisível" do caminhão e dos pneus, que se gastam rodando. Método linear por km:

```
Desgaste veículo/km = (valor_compra − valor_revenda) ÷ vida_útil_km
Desgaste pneus/km   = preço_do_jogo ÷ vida_útil_dos_pneus_km
Desgaste total/km   = veículo/km + pneus/km
Depreciação         = desgaste_total/km × km_rodados
Lucro real          = saldo − depreciação
```

- O km de cada rota fica em `config.js` (tabela `DISTANCIAS`). Por padrão o app considera **ida e volta**.
- Cada frete pode ter um km próprio preenchido automaticamente pela rota, mas editável.
- Os dados do veículo e dos pneus são informados **uma única vez** na tela "Meu Veículo".

---

## Funcionalidades

| Tela | O que faz |
|------|-----------|
| **Resumo** | Painel do mês: receitas, despesas, saldo, a receber, litros e km. Mostra depreciação estimada e lucro real quando o veículo está configurado. Filtro por mês/ano. |
| **Meus Fretes** | Lista os fretes do mês com status Pago/Pendente. Permite editar e excluir. |
| **Novo Frete** | Formulário com cálculo automático de preço, frete, lucro e desgaste. Km da rota preenchido automático (editável). Valida os campos antes de salvar. |
| **A Receber** | Lista todos os fretes pendentes (de qualquer mês) e o total a receber. Botão "Marcar pago". |
| **Meu Veículo** | Dados do caminhão e dos pneus (configuração única). Base para calcular a depreciação por km. |
| **Abastecimentos** | Registra combustível com litros, valor e km do painel. Calcula a média de consumo (km/L). |
| **Backup** | Exporta os fretes para `.csv` (abre no Excel) e importa de volta. Permite apagar todos os dados. |

---

## Arquitetura

O projeto segue uma separação em **camadas**: cada camada só conhece a de baixo. Isso centraliza os cálculos e o acesso a dados, evitando duplicação e bugs.

```
┌─────────────────────────────────────────────┐
│  VIEWS (telas)   resumo, fretes, frete, ...   │  ← desenham HTML e tratam cliques
├─────────────────────────────────────────────┤
│  ROUTER (app.js)                              │  ← decide qual tela mostrar pelo hash da URL
├─────────────────────────────────────────────┤
│  MODELS / STATE / UTILS                       │  ← cálculos, filtro de mês, formatação
├─────────────────────────────────────────────┤
│  DB (db.js)                                   │  ← coleções: fretes e abastecimentos (CRUD)
├─────────────────────────────────────────────┤
│  STORAGE (storage.js)                         │  ← lê e grava no localStorage com tratamento de erro
└─────────────────────────────────────────────┘
```

**Ponto-chave:** toda a lógica roda no navegador. Não há servidor — a camada `storage.js` é o único ponto de contato com o `localStorage`, com `try/catch` para garantir que erros de I/O nunca travem o app.

### Fluxo de dados — registrar um frete

```
Usuário preenche o formulário (views/frete.js)
        │
        ▼
validarFrete() + calcularFrete()  →  models/frete.js
        │
        ▼
fretes.adicionar()  →  db.js
        │
        ▼
save()  →  storage.js  →  localStorage
        │
        ▼
Router navega para "Meus Fretes" e redesenha a lista
```

### Padrão das views

Cada tela exporta duas funções:

- **`render()`** — retorna o HTML da tela como string.
- **`mount()`** — executada após o HTML entrar na página; liga os event listeners.

```js
export function render() {
  return `<h1 class="page-title">Minha Tela</h1>`;
}
export function mount() {
  document.getElementById('meu-botao')
    ?.addEventListener('click', () => { /* ... */ });
}
```

---

## Estrutura do Repositório

```
gestor-de-fretes/
├── index.html                  # página única — carrega CSS e o app.js
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   ├── variables.css        # cores, espaçamentos, fontes (tema)
    │   ├── base.css             # reset + layout geral (topbar, app, tabbar)
    │   └── components.css       # cartões, formulários, botões, listas
    └── js/
        ├── app.js               # ROUTER: lê o hash da URL e desenha a tela
        ├── config.js            # cidades, destinos, tabela de preços e distâncias
        ├── storage.js           # ler/gravar no localStorage (com try/catch)
        ├── db.js                # "banco" local: fretes e abastecimentos (CRUD)
        ├── state.js             # filtro de mês/ano compartilhado entre telas
        ├── settings.js          # configuração do veículo/pneus (base da depreciação)
        ├── models/
        │   ├── frete.js         # cálculo de frete/lucro e validação
        │   └── depreciacao.js   # desgaste (depreciação) linear por km
        ├── utils/
        │   ├── format.js        # formatar moeda (R$), números e datas
        │   ├── csv.js           # exportar/importar planilha .csv
        │   ├── icons.js         # ícones SVG reutilizáveis
        │   └── ui.js            # toast, escapeHtml, navegação, params de rota
        └── views/
            ├── resumo.js        # painel financeiro do mês
            ├── fretes.js        # lista de fretes
            ├── frete.js         # formulário de novo/editar frete
            ├── receber.js       # fretes pendentes
            ├── veiculo.js       # configuração do caminhão e pneus
            ├── abastecimento.js
            ├── mais.js          # menu secundário
            └── backup.js        # exportar/importar dados
```

---

## Tecnologia e Ferramentas

### Por que HTML, CSS e JavaScript puro?

Escolhi trabalhar sem framework porque queria entender cada linha do que estava escrevendo. React ou Vue adicionariam complexidade sem ganho real — o projeto é pequeno, o público usa celular, e qualquer dependência extra significa uma etapa de build que complica o deploy.

CSS puro dá controle total sobre o visual sem intermediários. ES Modules nativos do JavaScript já resolvem a organização do código em arquivos com `import`/`export` sem precisar de bundler — o navegador já faz isso sozinho.

### Por que sem framework?

- **Sem etapa de build** — não precisa de Node, npm nem compilação; é só abrir.
- **Sem overhead no celular** — sem runtime de framework, o app carrega mais rápido.
- **Cada linha é intencional** — não há "mágica" escondida por baixo.

### Por que `localStorage`?

Não havia necessidade de servidor. O motorista usa o app no próprio celular, os dados ficam salvos lá, e o app funciona offline sem custo de infraestrutura. A limitação — dados presos naquele dispositivo — é resolvida pelo backup em `.csv`.

### Por que CSV no backup?

Porque o Excel já é familiar para o público-alvo. Exportar para `.csv` não é só um backup técnico; é uma ponte com o mundo que o motorista já conhece. Se um dia precisar sair do app, os dados continuam acessíveis.

### Ferramentas de apoio

| Ferramenta | Por que uso |
|-----------|-------------|
| **Git** | Histórico do projeto; permite reverter mudanças com segurança. |
| **GitHub** | Backup do código na nuvem e integração com a Vercel para deploy automático. |
| **Vercel** | Deploy gratuito de sites estáticos com atualização automática a cada `git push`. |

---

## Como Executar Localmente

**Pré-requisito:** Python 3 instalado.

O projeto usa ES Modules, que o navegador bloqueia quando o arquivo é aberto com duplo clique. É necessário um servidor local:

```bash
# Na pasta do projeto:
python -m http.server 8000
```

Acesse `http://localhost:8000` no navegador. Para parar: `Ctrl + C`.

---

## Deploy

| Serviço | Plataforma | Observação |
|---------|-----------|-----------|
| Frontend | Vercel — site estático | Atualiza automaticamente a cada `git push` na branch `main` |

Não há configuração de build. A Vercel serve os arquivos como estão. Nenhuma variável de ambiente é necessária.

---

## Origem do Projeto

A ideia surgiu da experiência do um motorista, que trabalhou como e com motoristas de caminhão transportando combustível. Conversando com ele e com outros motoristas, ficou claro que havia uma necessidade comum: uma ferramenta simples para auxiliar nos cálculos e na gestão financeira do trabalho — sem planilhas complicadas, sem contas manuais.

Existia uma tentativa anterior, mas ela travava ao registrar viagens (erro de JavaScript não tratado) e usava conceitos genéricos que não refletiam como o motorista realmente trabalha — por litro transportado e por rota. Este projeto nasceu para corrigir exatamente esses dois problemas: espelhar a lógica que eles já conhecem e nunca travar.

---

## Autor

**Autor do projeto** — projeto desenvolvido para portfólio e uso real, a partir de uma necessidade genuína identificada em campo.

[github.com/nathanmxx](https://github.com/nathanmxx)

---

## Licença

MIT
