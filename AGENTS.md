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
- `InvoiceDetailsPage` deve receber apenas o `id` da invoice na rota; o payload da invoice e a colecao de `order_invoices` devem passar pelo store, sem `api.fetch` direto na tela.
- Quando a invoice vier de um pedido com agrupamento por `order_invoice`, o detalhe pode mostrar tanto o valor total da invoice quanto o `real_price` daquele pedido. Nunca inferir esse valor por pedido a partir do total agregado da invoice.
- `InvoiceDetailsPage` deve parecer uma tela operacional do sistema, proxima do detalhe de pedido, e listar os pedidos vinculados carregando `/order_invoices?invoice=...`.
- Em invoice, `paymentType` e o meio real de pagamento; `invoiceType` classifica a natureza financeira. Nao voltar a misturar desconto, taxa ou descricao operacional dentro do meio de pagamento.
- Totais de recebiveis, pagaveis, transferencias, pago e aberto devem vir de `invoiceGetters.summary`, preenchido pelo backend. Nao somar os cards carregados no front para exibir totais, porque a lista e paginada.
- Listagens React de invoices devem usar `DefaultSearch` e `DefaultExternalFilters` de `ui-default`, mantendo a busca em `filters.search` do store.
