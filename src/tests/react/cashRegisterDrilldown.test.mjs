import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCashDrilldownRequestParams} from '../../react/pages/cashRegisterDrilldown.js';

test('builds paid invoices filter by payment type and invoice date', () => {
  assert.deepEqual(
    buildCashDrilldownRequestParams({paymentTypeId: '63', from: '2026-11-01', to: '2026-11-30'}),
    {
      'status.realStatus': 'closed',
      invoiceType: ['invoice', 'payment'],
      paymentType: 63,
      'invoiceDate[after]': '2026-11-01 00:00:00',
      'invoiceDate[before]': '2026-11-30 23:59:59',
      excludeOwnTransfers: 0,
    },
  );
});

test('restricts to the user when the Caixa scope is the user', () => {
  const params = buildCashDrilldownRequestParams({paymentTypeId: 1, from: '2026-11-07', to: '2026-11-07', userId: 6});
  assert.equal(params.user, 6);
});

test('returns null for missing payment type or invalid period', () => {
  assert.equal(buildCashDrilldownRequestParams(null), null);
  assert.equal(buildCashDrilldownRequestParams({paymentTypeId: null, from: '2026-11-07', to: '2026-11-07'}), null);
  assert.equal(buildCashDrilldownRequestParams({paymentTypeId: 1, from: '2026-11-08', to: '2026-11-07'}), null);
  assert.equal(buildCashDrilldownRequestParams({paymentTypeId: 1, from: 'x', to: '2026-11-07'}), null);
});
