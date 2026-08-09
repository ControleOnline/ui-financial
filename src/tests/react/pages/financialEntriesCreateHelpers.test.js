const {
  resolveCreateRowDefaults,
  resolveCreateColumns,
} = require('../../../react/pages/financialEntriesCreateHelpers');

const { describe, expect, it } = global;

const company = { id: 42, name: 'Acme Ltda', alias: 'Acme' };

describe('financialEntriesCreateHelpers', () => {
  describe('resolveCreateRowDefaults', () => {
    it('returns invoiceType only when company is missing', () => {
      expect(resolveCreateRowDefaults({})).toEqual({ invoiceType: 'invoice' });
      expect(resolveCreateRowDefaults({ mode: 'payables' })).toEqual({
        invoiceType: 'invoice',
      });
    });

    it('locks active company as receiver for receivables', () => {
      expect(
        resolveCreateRowDefaults({ company, mode: 'receivables' }),
      ).toEqual({
        invoiceType: 'invoice',
        receiver: { id: 42, name: 'Acme Ltda', alias: 'Acme' },
      });
    });

    it('locks active company as payer for payables', () => {
      expect(resolveCreateRowDefaults({ company, mode: 'payables' })).toEqual({
        invoiceType: 'invoice',
        payer: { id: 42, name: 'Acme Ltda', alias: 'Acme' },
      });
    });

    it('locks both parties for ownTransfers', () => {
      expect(
        resolveCreateRowDefaults({ company, mode: 'ownTransfers' }),
      ).toEqual({
        invoiceType: 'invoice',
        payer: { id: 42, name: 'Acme Ltda', alias: 'Acme' },
        receiver: { id: 42, name: 'Acme Ltda', alias: 'Acme' },
      });
    });

    it('defaults to receivables when mode is omitted', () => {
      expect(resolveCreateRowDefaults({ company })).toEqual({
        invoiceType: 'invoice',
        receiver: { id: 42, name: 'Acme Ltda', alias: 'Acme' },
      });
    });
  });

  describe('resolveCreateColumns', () => {
    const columns = [
      { name: 'payer', editable: true },
      { name: 'receiver', editable: true },
      { name: 'price', editable: true },
    ];

    it('marks payer non-editable for payables', () => {
      const result = resolveCreateColumns(columns, 'payables');
      expect(result.find(c => c.name === 'payer')).toMatchObject({
        editable: false,
        form: true,
      });
      expect(result.find(c => c.name === 'receiver').editable).toBe(true);
      expect(result.find(c => c.name === 'price').editable).toBe(true);
    });

    it('marks receiver non-editable for receivables', () => {
      const result = resolveCreateColumns(columns, 'receivables');
      expect(result.find(c => c.name === 'receiver')).toMatchObject({
        editable: false,
        form: true,
      });
      expect(result.find(c => c.name === 'payer').editable).toBe(true);
    });

    it('marks both parties non-editable for ownTransfers', () => {
      const result = resolveCreateColumns(columns, 'ownTransfers');
      expect(result.find(c => c.name === 'payer').editable).toBe(false);
      expect(result.find(c => c.name === 'receiver').editable).toBe(false);
    });

    it('returns empty array safely', () => {
      expect(resolveCreateColumns(undefined, 'payables')).toEqual([]);
    });
  });
});
