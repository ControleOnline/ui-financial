/**
 * Helpers for contextual create of financial entries (payables / receivables / transfers).
 */

const normalizeText = value => String(value || '').trim();

/**
 * Build DefaultForm row defaults so the active company is locked as the correct party.
 * @param {{ company?: { id?: number|string, name?: string, alias?: string }, mode?: string }} args
 */
function resolveCreateRowDefaults({ company, mode } = {}) {
  if (!company?.id) {
    return { invoiceType: 'invoice' };
  }

  const companyOption = {
    id: company.id,
    name: company.name || company.alias || '',
    alias: company.alias || company.name || '',
  };

  if (mode === 'payables') {
    return {
      invoiceType: 'invoice',
      payer: companyOption,
    };
  }

  if (mode === 'ownTransfers') {
    return {
      invoiceType: 'invoice',
      payer: companyOption,
      receiver: companyOption,
    };
  }

  return {
    invoiceType: 'invoice',
    receiver: companyOption,
  };
}

/**
 * Mark the fixed party column as non-editable for the active mode.
 */
function resolveCreateColumns(columns = [], mode = 'receivables') {
  return (columns || []).map(column => {
    const name = column?.name;
    if (mode === 'payables' && name === 'payer') {
      return { ...column, editable: false, form: true };
    }
    if (mode === 'receivables' && name === 'receiver') {
      return { ...column, editable: false, form: true };
    }
    if (mode === 'ownTransfers' && (name === 'payer' || name === 'receiver')) {
      return { ...column, editable: false, form: true };
    }
    return column;
  });
}

module.exports = {
  resolveCreateRowDefaults,
  resolveCreateColumns,
  normalizeText,
};
