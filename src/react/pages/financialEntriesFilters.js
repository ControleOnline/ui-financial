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
