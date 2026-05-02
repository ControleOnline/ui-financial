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
- `InvoiceDetailsPage` e a rota de detalhe de invoice em React sao a referencia canonica para abrir uma invoice especifica fora das listagens.
- Quando a invoice vier de um pedido com agrupamento por `order_invoice`, o detalhe pode mostrar tanto o valor total da invoice quanto o `real_price` daquele pedido. Nunca inferir esse valor por pedido a partir do total agregado da invoice.
