const {
  getWalletPaymentTypePreview,
} = require('../../../react/pages/walletsPagePreview')

const {describe, expect, it} = global

describe('walletsPagePreview', () => {
  it('deduplicates wallet payment types that share the same visible label', () => {
    const preview = getWalletPaymentTypePreview([
      {
        id: 170,
        paymentType: {
          id: 65,
          paymentType: 'Dinheiro',
        },
      },
      {
        id: 240,
        paymentType: {
          id: 41,
          paymentType: 'Dinheiro',
        },
      },
      {
        id: 171,
        paymentType: {
          id: 64,
          paymentType: 'Debito',
        },
      },
    ])

    expect(preview.map(item => item.id)).toEqual([170, 171])
  })
})
