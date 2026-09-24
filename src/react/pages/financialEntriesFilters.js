const normalizeText = value => String(value || '').trim();

const getColumnKey = column => column?.key || column?.name || '';

const normalizeFilterValue = value => {
  if (value && typeof value === 'object') {
    return normalizeFilterValue(value.value ?? value.id ?? value['@id'] ?? '');
  }

  return normalizeText(value);
};

const resolveSavedFilterValue = (column, value) => {
  if (!column) {
    return normalizeFilterValue(value);
  }

  const formattedValue = typeof column?.saveFormat === 'function'
    ? column.saveFormat(value, column, null)
    : value && typeof value === 'object'
      ? (value.value || value['@id'] || value)
      : value;
  return normalizeFilterValue(
    formattedValue === undefined ? value : formattedValue,
  );
};

export const resolveFinancialFilterParamValue = ({
  columns = [],
  fieldName = '',
  value,
}) => {
  const column = (Array.isArray(columns) ? columns : []).find(
    item => getColumnKey(item) === fieldName,
  );

  if (Array.isArray(value)) {
    return value
      .map(item => resolveSavedFilterValue(column, item))
      .filter(Boolean);
  }

  return resolveSavedFilterValue(column, value);
};

export const resolveInvoiceCategoryListParams = ({currentCompanyId, requestParams = {}} = {}) => {
  if (!currentCompanyId) return {};

  const context = requestParams.ownTransfers
    ? 'transfer'
    : requestParams.payer
      ? 'payer'
      : 'receive';

  return {company: currentCompanyId, context};
};

const resolveRequestContext = requestParams => {
  const isPayables = Boolean(requestParams?.payer) && !requestParams?.receiver;
  const isReceivables = Boolean(requestParams?.receiver) && !requestParams?.payer;

  return {isPayables, isReceivables};
};

const resolveEntityId = value => {
  if (value && typeof value === 'object') {
    return resolveEntityId(value.value ?? value.id ?? value['@id'] ?? '');
  }

  return String(value || '').replace(/\D/g, '');
};

export const resolveInvoiceCreateFieldVisibility = ({fieldName, requestParams = {}} = {}) => {
  const {isPayables, isReceivables} = resolveRequestContext(requestParams);

  if (fieldName === 'payer') return isReceivables;
  if (fieldName === 'receiver') return isPayables;
  if (fieldName === 'sourceWallet') return isPayables;
  if (fieldName === 'destinationWallet') return isReceivables;
  if (fieldName === 'invoiceType') return false;

  return true;
};

export const resolveInvoicePaymentTypeListParams = ({requestParams = {}, row = {}, variant = 'cell'} = {}) => {
  const {isPayables, isReceivables} = resolveRequestContext(requestParams);
  const walletId = isPayables
    ? resolveEntityId(row.sourceWallet)
    : isReceivables
      ? resolveEntityId(row.destinationWallet)
      : resolveEntityId(row.sourceWallet || row.destinationWallet);

  if (walletId) return {wallet: walletId};

  return variant === 'form' ? {wallet: 0} : {};
};

export const resolveInvoicePartyListParams = ({
  columnName,
  currentCompanyId,
  requestParams = {},
} = {}) => {
  if (!currentCompanyId) return {};

  const companyIri = `/people/${currentCompanyId}`;
  const isOwnTransfer = Boolean(requestParams.ownTransfers);
  const isPayables = Boolean(requestParams.payer) && !requestParams.receiver;
  const isReceivables = Boolean(requestParams.receiver) && !requestParams.payer;

  if (
    isOwnTransfer
    || (isReceivables && columnName === 'receiver')
    || (isPayables && columnName === 'payer')
  ) {
    return {id: currentCompanyId};
  }

  if (isReceivables && columnName === 'payer') {
    return {
      'link.company': companyIri,
      'link.linkType': ['client', 'provider'],
    };
  }

  return {'link.company': companyIri};
};
