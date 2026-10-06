export const invoiceGetInFlight = new Map()
export const orderInvoicesGetInFlight = new Map()

export const getEntityId = entity => {
  if (!entity) return null

  if (typeof entity === 'number' || typeof entity === 'string') {
    const match = String(entity).match(/\d+/g)
    return match ? Number(match[match.length - 1]) : null
  }

  if (typeof entity === 'object') {
    if (entity.id) return Number(entity.id)
    if (entity['@id']) {
      const match = String(entity['@id']).match(/\d+/g)
      return match ? Number(match[match.length - 1]) : null
    }
  }

  return null
}

export const normalizeMoney = value => {
  const normalizedValue = Number(value)
  return Number.isFinite(normalizedValue) ? normalizedValue : 0
}

const normalizeStatusValue = value =>
  String(value || '')
    .trim()
    .toLowerCase()

const isCancelledStatusValue = value =>
  ['canceled', 'cancelled'].includes(normalizeStatusValue(value))

export const isOrderCancelled = order =>
  isCancelledStatusValue(order?.status?.status) ||
  isCancelledStatusValue(order?.status?.realStatus) ||
  isCancelledStatusValue(order?.status?.real_status)

export const hasHydratedInvoiceDetails = invoice => {
  if (!invoice || typeof invoice !== 'object') {
    return false
  }

  return [
    invoice?.status,
    invoice?.dueDate,
    invoice?.invoice_date,
    invoice?.paymentType,
    invoice?.payment_type,
    invoice?.sourceWallet,
    invoice?.destinationWallet,
    invoice?.payer,
    invoice?.receiver,
    invoice?.description,
  ].some(Boolean)
}

export const getStatusLabel = status =>
  global.t?.t('invoice', 'label', status) || status || '-'

export const resolveStatusColor = invoice => {
  const normalizedRealStatus = String(
    invoice?.status?.realStatus || invoice?.status?.real_status || '',
  )
    .trim()
    .toLowerCase()
  const normalizedStatus = String(invoice?.status?.status || '')
    .trim()
    .toLowerCase()

  if (
    normalizedRealStatus === 'closed' ||
    normalizedStatus === 'closed' ||
    normalizedStatus === 'paid'
  ) {
    return '#16A34A'
  }

  if (
    normalizedRealStatus === 'pending' ||
    ['pending', 'waiting payment', 'waiting_payment', 'open'].includes(
      normalizedStatus,
    )
  ) {
    return '#D97706'
  }

  if (['canceled', 'cancelled'].includes(normalizedStatus)) {
    return '#c10015'
  }

  return '#0EA5E9'
}

export const formatApiError = error => {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (Array.isArray(error?.message)) {
    return error.message
      .map(item => item?.message || item?.title || String(item))
      .filter(Boolean)
      .join('\n')
  }

  return error?.message || error?.description || error?.errmsg || ''
}

export const normalizeLinkedOrderInvoice = orderInvoice => {
  const rawOrder = orderInvoice?.order
  const orderId = getEntityId(rawOrder)

  if (!orderId && !rawOrder) {
    return null
  }

  const embeddedOrder =
    rawOrder && typeof rawOrder === 'object'
      ? {
          ...rawOrder,
          id: rawOrder?.id || orderId,
          '@id': rawOrder?.['@id'] || (orderId ? `/orders/${orderId}` : undefined),
        }
      : {
          id: orderId,
          '@id': orderId ? `/orders/${orderId}` : undefined,
        }
  const isCancelled = isOrderCancelled(embeddedOrder)
  const normalizedOrder = isCancelled
    ? {
        ...embeddedOrder,
        status: {
          ...(embeddedOrder?.status || {}),
          color: '#DC2626',
        },
      }
    : embeddedOrder

  return {
    id: orderInvoice?.id || `invoice-link-${orderId || 'unknown'}`,
    orderId: normalizedOrder?.id || orderId,
    order: normalizedOrder,
    realPrice: normalizeMoney(orderInvoice?.realPrice ?? orderInvoice?.real_price),
    isCancelled,
  }
}
