const {
  resolveFinancialFilterParamValue,
  resolveInvoiceCategoryListParams,
  resolveInvoicePartyListParams,
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

describe('invoice master list scopes', () => {
  it('uses receive categories for receivables and payer categories for payables', () => {
    expect(resolveInvoiceCategoryListParams({
      currentCompanyId: 21,
      requestParams: {receiver: 21},
    })).toEqual({company: 21, context: 'receive'});
    expect(resolveInvoiceCategoryListParams({
      currentCompanyId: 21,
      requestParams: {payer: 21},
    })).toEqual({company: 21, context: 'payer'});
  });

  it('uses client and provider links for receivable payers', () => {
    expect(resolveInvoicePartyListParams({
      columnName: 'payer',
      currentCompanyId: 21,
      requestParams: {receiver: 21},
    })).toEqual({
      'link.company': '/people/21',
      'link.linkType': ['client', 'provider'],
    });
  });

  it('uses every company link for payable receivers', () => {
    expect(resolveInvoicePartyListParams({
      columnName: 'receiver',
      currentCompanyId: 21,
      requestParams: {payer: 21},
    })).toEqual({'link.company': '/people/21'});
  });

  it('keeps the selected company fixed on the non-variable side', () => {
    expect(resolveInvoicePartyListParams({
      columnName: 'receiver',
      currentCompanyId: 21,
      requestParams: {receiver: 21},
    })).toEqual({id: 21});
    expect(resolveInvoicePartyListParams({
      columnName: 'payer',
      currentCompanyId: 21,
      requestParams: {payer: 21},
    })).toEqual({id: 21});
  });
});

