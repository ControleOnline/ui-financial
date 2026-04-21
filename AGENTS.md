## Escopo
- Modulo financeiro.
- Cobre invoices, wallets, payment types, recebiveis, pagaveis, transferencias e integracao Asaas.

## Estado
- Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
- Se existir `src/vue`, ela e apenas legado e deve ser ignorada, salvo pedido explicito.

## Quando usar
- Prompts sobre financeiro, carteira, categorias de fatura, cartao salvo, recebiveis, pagaveis, Pix e cobranca online com Asaas.

## Limites
- Regras operacionais de checkout de pedido pertencem primeiro a `ui-orders` ou `ui-shop`; `ui-financial` deve concentrar a camada financeira compartilhada.
