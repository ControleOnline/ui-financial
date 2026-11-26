/**
 * The public lookup accepts only normalized Brazilian document lengths.
 * Check digits are intentionally validated by the API, which remains the source of truth.
 */
const normalizePaylistDocument = value =>
  String(value || '').replace(/\D/g, '').trim();

const isValidPaylistDocument = value => {
  const normalized = normalizePaylistDocument(value);
  return normalized.length === 11 || normalized.length === 14;
};

module.exports = {
  isValidPaylistDocument,
  normalizePaylistDocument,
};
