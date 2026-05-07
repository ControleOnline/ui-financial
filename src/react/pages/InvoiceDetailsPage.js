import React, {useCallback, useEffect, useMemo} from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useStore} from '@store'
import Formatter from '@controleonline/ui-common/src/utils/formatter.js'
import {colors} from '@controleonline/../../src/styles/colors'
import {resolveThemePalette, withOpacity} from '@controleonline/../../src/styles/branding'
import {
  formatInvoiceTypeLabel,
  getInvoicePartyLabel,
  getInvoicePaymentTypeLabel,
} from '@controleonline/ui-common/src/react/utils/invoicePresentation'
import OrderHeader from '@controleonline/ui-orders/src/react/components/OrderHeader'
import {buildOrderDetailsRouteParams} from '@controleonline/ui-orders/src/react/utils/orderRoute'
import useOrderDetailsVisuals from '@controleonline/ui-orders/src/react/pages/orders/sales/useOrderDetailsVisuals'

import createStyles from './InvoiceDetailsPage.styles'

const getEntityId = entity => {
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

const normalizeMoney = value => {
  const normalizedValue = Number(value)
  return Number.isFinite(normalizedValue) ? normalizedValue : 0
}

const normalizeStatusValue = value =>
  String(value || '')
    .trim()
    .toLowerCase()

const isCancelledStatusValue = value =>
  ['canceled', 'cancelled'].includes(normalizeStatusValue(value))

const isOrderCancelled = order =>
  isCancelledStatusValue(order?.status?.status) ||
  isCancelledStatusValue(order?.status?.realStatus) ||
  isCancelledStatusValue(order?.status?.real_status)

const hasHydratedInvoiceDetails = invoice => {
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

const getStatusLabel = status =>
  global.t?.t('invoice', 'label', status) || status || '-'

const resolveStatusColor = invoice => {
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
    return '#EF4444'
  }

  return '#0EA5E9'
}

const formatApiError = error => {
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

const normalizeLinkedOrderInvoice = orderInvoice => {
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

function InvoiceDetailsPage({navigation, route}) {
  const invoiceId = useMemo(
    () => getEntityId(route.params?.id),
    [route.params?.id],
  )

  const invoiceStore = useStore('invoice')
  const orderInvoicesStore = useStore('order_invoices')
  const peopleStore = useStore('people')
  const themeStore = useStore('theme')
  const {ppcColors} = useOrderDetailsVisuals()

  const {item: storeInvoice, isLoading} = invoiceStore.getters
  const {
    items: linkedOrderInvoiceItems,
    isLoading: isLoadingLinkedOrders,
    error: linkedOrdersStoreError,
  } = orderInvoicesStore.getters
  const {currentCompany} = peopleStore.getters
  const {colors: themeColors} = themeStore.getters

  const brandColors = useMemo(
    () =>
      resolveThemePalette(
        {...themeColors, ...(currentCompany?.theme?.colors || {})},
        colors,
      ),
    [currentCompany?.id, themeColors],
  )
  const styles = useMemo(
    () => createStyles(ppcColors, brandColors),
    [brandColors, ppcColors],
  )

  const invoice = useMemo(() => {
    if (getEntityId(storeInvoice) === invoiceId) {
      return storeInvoice
    }

    return null
  }, [invoiceId, storeInvoice])
  const linkedOrderInvoices = useMemo(
    () =>
      (Array.isArray(linkedOrderInvoiceItems) ? linkedOrderInvoiceItems : [])
        .map(normalizeLinkedOrderInvoice)
        .filter(Boolean),
    [linkedOrderInvoiceItems],
  )
  const activeLinkedOrderInvoices = useMemo(
    () => linkedOrderInvoices.filter(linkedOrderInvoice => !linkedOrderInvoice?.isCancelled),
    [linkedOrderInvoices],
  )
  const cancelledLinkedOrderInvoices = useMemo(
    () => linkedOrderInvoices.filter(linkedOrderInvoice => !!linkedOrderInvoice?.isCancelled),
    [linkedOrderInvoices],
  )
  const linkedOrdersError = useMemo(
    () => formatApiError(linkedOrdersStoreError),
    [linkedOrdersStoreError],
  )

  const statusColor = useMemo(() => resolveStatusColor(invoice), [invoice])

  useEffect(() => {
    navigation.setOptions({
      title: invoiceId ? `Invoice #${invoiceId}` : 'Detalhe da invoice',
    })
  }, [invoiceId, navigation])

  useEffect(() => {
    if (
      invoiceId &&
      typeof invoiceStore.actions?.get === 'function' &&
      (
        getEntityId(storeInvoice) !== invoiceId ||
        !hasHydratedInvoiceDetails(storeInvoice)
      )
    ) {
      invoiceStore.actions.get(invoiceId).catch(() => null)
    }
  }, [invoiceId, invoiceStore.actions, storeInvoice])

  useEffect(() => {
    if (!invoiceId) {
      orderInvoicesStore.actions?.setItems?.([])
      orderInvoicesStore.actions?.setError?.('')
      return
    }

    if (typeof orderInvoicesStore.actions?.getItems === 'function') {
      orderInvoicesStore.actions.getItems({
        invoice: `/invoices/${invoiceId}`,
        itemsPerPage: 100,
      }).catch(() => null)
    }
  }, [invoiceId, orderInvoicesStore.actions])

  const linkedOrdersCount = activeLinkedOrderInvoices.length
  const cancelledLinkedOrdersCount = cancelledLinkedOrderInvoices.length
  const linkedOrdersAmount = useMemo(
    () =>
      activeLinkedOrderInvoices.reduce(
        (total, orderInvoice) => total + normalizeMoney(orderInvoice?.realPrice),
        0,
      ),
    [activeLinkedOrderInvoices],
  )
  const invoiceDisplayAmount = useMemo(() => {
    if (linkedOrderInvoices.length) {
      return linkedOrdersAmount
    }

    return normalizeMoney(invoice?.price)
  }, [invoice?.price, linkedOrderInvoices.length, linkedOrdersAmount])
  const invoiceRawAmount = useMemo(
    () => normalizeMoney(invoice?.price),
    [invoice?.price],
  )

  const detailCards = useMemo(
    () =>
      [
        {
          key: 'invoiceType',
          label: global.t?.t('orders', 'label', 'invoiceType') || 'Tipo',
          value: formatInvoiceTypeLabel(
            invoice?.invoiceType || invoice?.invoice_type || 'invoice',
          ),
        },
        {
          key: 'paymentType',
          label:
            global.t?.t('orders', 'label', 'paymentMethod') ||
            'Forma de pagamento',
          value: getInvoicePaymentTypeLabel(invoice),
        },
        {
          key: 'dueDate',
          label: global.t?.t('invoice', 'label', 'dueDate') || 'Vencimento',
          value: Formatter.formatDateYmdTodmY(invoice?.dueDate),
        },
        {
          key: 'linkedOrders',
          label: global.t?.t('orders', 'title', 'orders') || 'Pedidos',
          value: linkedOrdersCount ? String(linkedOrdersCount) : '',
        },
        {
          key: 'payer',
          label: global.t?.t('orders', 'label', 'payer') || 'Pagador',
          value: getInvoicePartyLabel(invoice?.payer),
        },
        {
          key: 'receiver',
          label: global.t?.t('orders', 'label', 'receiver') || 'Recebedor',
          value: getInvoicePartyLabel(invoice?.receiver),
        },
        {
          key: 'sourceWallet',
          label:
            global.t?.t('invoice', 'label', 'sourceWallet') || 'Carteira origem',
          value: String(invoice?.sourceWallet?.wallet || '').trim(),
        },
        {
          key: 'destinationWallet',
          label:
            global.t?.t('invoice', 'label', 'destinationWallet') ||
            'Carteira destino',
          value: String(invoice?.destinationWallet?.wallet || '').trim(),
        },
        {
          key: 'description',
          label: global.t?.t('orders', 'label', 'description') || 'Descrição',
          value: String(invoice?.description || '').trim(),
          wide: true,
        },
      ].filter(card => card.value),
    [invoice, linkedOrdersCount],
  )

  const handleOpenOrderDetails = useCallback(
    linkedOrderInvoice => {
      const nextOrderId = getEntityId(linkedOrderInvoice?.order)

      if (!nextOrderId) {
        return
      }

      navigation.navigate(
        'OrderDetails',
        buildOrderDetailsRouteParams(nextOrderId),
      )
    },
    [navigation],
  )

  const renderLinkedOrders = () => {
    if (isLoadingLinkedOrders) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={ppcColors.accentInfo} />
          <Text style={styles.loadingText}>
            {global.t?.t('orders', 'label', 'loading') || 'Carregando pedidos...'}
          </Text>
        </View>
      )
    }

    if (linkedOrdersError) {
      return <Text style={styles.emptyText}>{linkedOrdersError}</Text>
    }

    if (!linkedOrderInvoices.length) {
      return (
        <Text style={styles.emptyText}>
          {global.t?.t('invoice', 'message', 'noLinkedOrders') ||
            'Nenhum pedido vinculado a esta invoice.'}
        </Text>
      )
    }

    return linkedOrderInvoices.map(linkedOrderInvoice => {
      const isCancelledLinkedOrder = !!linkedOrderInvoice?.isCancelled

      return (
        <TouchableOpacity
          key={linkedOrderInvoice.id}
          onPress={() => handleOpenOrderDetails(linkedOrderInvoice)}
          style={[
            styles.linkedOrderCard,
            isCancelledLinkedOrder && styles.linkedOrderCardCancelled,
          ]}>
          <OrderHeader order={linkedOrderInvoice.order} />
          {isCancelledLinkedOrder ? (
            <Text style={styles.linkedOrderCancelledHint}>
              {global.t?.t('invoice', 'label', 'cancelledOrderExcludedFromTotal') ||
                'Pedido cancelado. Valor fora do total desta invoice.'}
            </Text>
          ) : null}
          <View style={styles.linkedOrderMetaRow}>
            <View>
              <Text style={styles.linkedOrderMetaLabel}>
                {global.t?.t('invoice', 'label', 'linkedAmount') ||
                  'Valor vinculado'}
              </Text>
            </View>
            <Text
              style={[
                styles.linkedOrderMetaValue,
                isCancelledLinkedOrder && styles.linkedOrderMetaValueCancelled,
              ]}>
              {Formatter.formatMoney(linkedOrderInvoice.realPrice || 0)}
            </Text>
          </View>
        </TouchableOpacity>
      )
    })
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={styles.safeArea}>
      {!invoiceId ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>Invoice inválida.</Text>
        </View>
      ) : isLoading && !invoice ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={brandColors.primary} />
        </View>
      ) : !invoice ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>
            Não foi possível carregar a invoice.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.summaryTitleWrap}>
                <Text style={styles.summaryEyebrow}>Financeiro</Text>
                <Text style={styles.summaryTitle}>Invoice #{invoiceId}</Text>
                <Text style={styles.summarySubtitle}>
                  {global.t?.t('invoice', 'label', 'details') ||
                    'Detalhe operacional da invoice'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: withOpacity(statusColor, 0.12),
                    borderColor: statusColor,
                  },
                ]}>
                <Text style={[styles.statusChipText, {color: statusColor}]}>
                  {getStatusLabel(invoice?.status?.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.amountText}>
              {Formatter.formatMoney(invoiceDisplayAmount)}
            </Text>

            <View style={styles.summaryMetaStack}>
              <Text style={styles.summaryMetaText}>
                {global.t?.t('invoice', 'label', 'linkedOrdersAmountActive') ||
                  'Total considerado em pedidos ativos'}:{' '}
                <Text style={styles.summaryMetaHighlight}>
                  {Formatter.formatMoney(linkedOrdersAmount)}
                </Text>
              </Text>
              {cancelledLinkedOrdersCount ? (
                <Text style={styles.summaryMetaWarning}>
                  {cancelledLinkedOrdersCount === 1
                    ? '1 pedido cancelado ficou fora do total.'
                    : `${cancelledLinkedOrdersCount} pedidos cancelados ficaram fora do total.`}
                </Text>
              ) : null}
              {linkedOrderInvoices.length && invoiceRawAmount !== linkedOrdersAmount ? (
                <Text style={styles.summaryMetaText}>
                  {global.t?.t('invoice', 'label', 'grossInvoiceAmount') ||
                    'Valor bruto registrado na invoice'}:{' '}
                  <Text style={styles.summaryMetaHighlight}>
                    {Formatter.formatMoney(invoiceRawAmount)}
                  </Text>
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {global.t?.t('invoice', 'title', 'details') || 'Detalhes'}
            </Text>
            <View style={styles.infoGrid}>
              {detailCards.map(card => (
                <View
                  key={card.key}
                  style={[styles.infoCard, card.wide && styles.infoCardWide]}>
                  <Text style={styles.infoHeader}>{card.label}</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      !card.value && styles.infoValueMuted,
                    ]}>
                    {card.value || '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {global.t?.t('orders', 'title', 'orders') || 'Pedidos vinculados'}
            </Text>
            {renderLinkedOrders()}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default InvoiceDetailsPage
