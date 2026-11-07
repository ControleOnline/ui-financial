const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Translates the filters chosen on the Caixa screen (CashRegisterSummary,
 * ui-common) into invoice list request params, mirroring the consolidated
 * query: paid invoices (closed), invoice/payment types, by payment type and
 * invoice date. Refs: ControleOnline/ui-common#131
 */
export const buildCashDrilldownRequestParams = cashFilter => {
  const paymentTypeId = Number(cashFilter?.paymentTypeId);
  const from = String(cashFilter?.from || '');
  const to = String(cashFilter?.to || '');

  if (!Number.isInteger(paymentTypeId) || paymentTypeId <= 0) return null;
  if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to) || to < from) return null;

  const params = {
    'status.realStatus': 'closed',
    invoiceType: ['invoice', 'payment'],
    paymentType: paymentTypeId,
    'invoiceDate[after]': `${from} 00:00:00`,
    'invoiceDate[before]': `${to} 23:59:59`,
    excludeOwnTransfers: 0,
  };

  const userId = Number(cashFilter?.userId);
  if (Number.isInteger(userId) && userId > 0) params.user = userId;

  return params;
};
