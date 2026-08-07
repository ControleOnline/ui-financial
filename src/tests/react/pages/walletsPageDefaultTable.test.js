/* global describe, expect, it */

const {getWalletPaymentTypePreview} = require('../../../react/pages/walletsPagePreview');

describe('wallets DefaultTable migration helpers', () => {
  it('getWalletPaymentTypePreview dedupes by label', () => {
    const preview = getWalletPaymentTypePreview([
      {id: 1, paymentType: {id: 5, paymentType: 'Dinheiro'}},
      {id: 2, paymentType: {id: 5, paymentType: 'Dinheiro'}},
      {id: 3, paymentType: {id: 6, paymentType: 'Pix'}},
    ]);
    expect(preview.map(item => item.paymentType.paymentType)).toEqual(['Dinheiro', 'Pix']);
  });

  it('getWalletPaymentTypePreview ignores empty labels', () => {
    const preview = getWalletPaymentTypePreview([
      {id: 1, paymentType: null},
      {id: 2, paymentType: '/payment_types/9'},
    ]);
    expect(preview).toEqual([]);
  });
});
