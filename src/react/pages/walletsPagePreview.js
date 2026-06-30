const normalizePreviewLabel = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const resolvePaymentTypeLabel = walletPaymentType => {
  const paymentType = walletPaymentType?.paymentType;

  if (paymentType && typeof paymentType === 'object') {
    return paymentType.paymentType || paymentType.name || '';
  }

  return '';
};

export const getWalletPaymentTypePreview = walletPaymentTypes => {
  const seenLabels = new Set();

  return (Array.isArray(walletPaymentTypes) ? walletPaymentTypes : []).filter(item => {
    const label = resolvePaymentTypeLabel(item);

    if (!label) {
      return false;
    }

    const previewKey = normalizePreviewLabel(label) || String(item?.id || '');

    if (seenLabels.has(previewKey)) {
      return false;
    }

    seenLabels.add(previewKey);
    return true;
  });
};
