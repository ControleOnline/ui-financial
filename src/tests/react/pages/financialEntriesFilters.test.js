const {
  resolveFinancialFilterParamValue,
} = require('../../../react/pages/financialEntriesFilters');

const { describe, expect, it } = global;

describe('financialEntriesFilters', () => {
  const columns = [
    {
      name: 'paymentType',
      saveFormat(value) {
        return value ? `/payment_types/${value?.value || value}` : null;
      },
    },
    {
      name: 'status',
      saveFormat(value) {
        return value ? `/statuses/${value?.value || value}` : null;
      },
    },
  ];

  it('serializes payment type filters with the canonical payment type iri', () => {
    expect(
      resolveFinancialFilterParamValue({
        columns,
        fieldName: 'paymentType',
        value: '12',
      }),
    ).toBe('/payment_types/12');
  });

  it('serializes object-based selections using the same column contract', () => {
    expect(
      resolveFinancialFilterParamValue({
        columns,
        fieldName: 'status',
        value: { value: '33', label: 'Pago' },
      }),
    ).toBe('/statuses/33');
  });

  it('keeps plain values when the column has no save formatter', () => {
    expect(
      resolveFinancialFilterParamValue({
        columns,
        fieldName: 'search',
        value: 'pix',
      }),
    ).toBe('pix');
  });
});

