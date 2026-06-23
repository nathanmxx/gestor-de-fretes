# 🚚 Gestor de Fretes

App simples para motoristas controlarem seus fretes, ganhos e gastos — feito
para ser **fácil de usar** mesmo para quem não tem familiaridade com tecnologia.

Pensado a partir da planilha real de um motorista que transporta combustível e
cobra **por litro transportado**, conforme a rota.

## ✨ O que ele faz

- **Registrar frete**: escolhe origem e destino → o preço por litro, o valor do
  frete e o lucro são **calculados automaticamente** (zero conta na cabeça).
- **Meus Fretes**: lista do mês, com status Pago/Pendente, editar e excluir.
- **A Receber**: soma tudo que ainda falta receber, em um lugar só.
- **Resumo**: receitas, despesas, saldo (lucro) e litros do mês.
- **Abastecimentos**: combustível, valor e km do painel → média km/L.
- **Backup**: exporta/importa um `.csv` que abre no Excel.

## 💰 Tabela de preços (R$ por litro)

| Origem | → Destino 1 | → Destino 2 |
|--------|:---:|:---:|
| Cidade A | 0,10 | 0,15 |
| Cidade B | 0,25 | 0,30 |
| Cidade C | 0,35 | 0,40 |

> Para alterar os preços, edite `assets/js/config.js`.

## 🛠️ Tecnologia

HTML + CSS + JavaScript puro (ES Modules). **Sem framework, sem build.**
Os dados ficam salvos no próprio navegador (`localStorage`).

## ▶️ Como rodar no seu computador

Como o projeto usa módulos JavaScript, ele precisa ser servido por um servidor
local (não funciona abrindo o arquivo direto com duplo clique).

```bash
# dentro da pasta do projeto:
python -m http.server 8000
```

Depois abra no navegador: <http://localhost:8000>

## ☁️ Como publicar (Vercel)

1. Suba o projeto pro GitHub (`git push`).
2. Em [vercel.com](https://vercel.com), importe o repositório.
3. Não precisa configurar nada (é site estático). Clique em **Deploy**.

## 📁 Estrutura

```
gestor-de-fretes/
├── index.html              # página única (carrega tudo)
├── assets/
│   ├── css/                # variáveis de tema, base e componentes
│   └── js/
│       ├── app.js          # roteador (decide qual tela mostrar)
│       ├── config.js       # cidades, destinos e tabela de preços
│       ├── storage.js      # leitura/gravação no navegador
│       ├── db.js           # "banco" local (fretes, abastecimentos)
│       ├── state.js        # filtro de mês compartilhado
│       ├── models/         # regras de cálculo do frete
│       ├── utils/          # formatação, csv, ícones, helpers
│       └── views/          # as telas (resumo, fretes, frete, ...)
```

## 📄 Licença

MIT
