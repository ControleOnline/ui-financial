import React, {useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useStore} from '@store';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import {colors} from '@controleonline/../../src/styles/colors';
import {resolveThemePalette, withOpacity} from '@controleonline/../../src/styles/branding';

const getEntityId = entity => {
  if (!entity) return null;

  if (typeof entity === 'number' || typeof entity === 'string') {
    const match = String(entity).match(/\d+/g);
    return match ? Number(match[match.length - 1]) : null;
  }

  if (typeof entity === 'object') {
    if (entity.id) return Number(entity.id);
    if (entity['@id']) {
      const match = String(entity['@id']).match(/\d+/g);
      return match ? Number(match[match.length - 1]) : null;
    }
  }

  return null;
};

const getStatusLabel = status =>
  global.t?.t('invoice', 'label', status) || status || '-';

const getPartyLabel = entity =>
  entity?.alias || entity?.name || entity?.fantasy_name || entity?.company || '-';

const normalizeMoney = value => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const resolveStatusColor = invoice => {
  const normalizedRealStatus = String(
    invoice?.status?.realStatus || invoice?.status?.real_status || '',
  )
    .trim()
    .toLowerCase();
  const normalizedStatus = String(invoice?.status?.status || '')
    .trim()
    .toLowerCase();

  if (
    normalizedRealStatus === 'closed' ||
    normalizedStatus === 'closed' ||
    normalizedStatus === 'paid'
  ) {
    return '#16A34A';
  }

  if (
    normalizedRealStatus === 'pending' ||
    ['pending', 'waiting payment', 'waiting_payment', 'open'].includes(
      normalizedStatus,
    )
  ) {
    return '#D97706';
  }

  if (['canceled', 'cancelled'].includes(normalizedStatus)) {
    return '#EF4444';
  }

  return '#0EA5E9';
};

function InvoiceDetailsPage({navigation, route}) {
  const invoiceId = useMemo(
    () => getEntityId(route.params?.id || route.params?.invoiceId),
    [route.params?.id, route.params?.invoiceId],
  );
  const linkedOrderAmount = useMemo(
    () => normalizeMoney(route.params?.realPrice),
    [route.params?.realPrice],
  );
  const linkedOrderId = useMemo(
    () => getEntityId(route.params?.orderId),
    [route.params?.orderId],
  );

  const invoiceStore = useStore('invoice');
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');

  const {item: storeInvoice, isLoading} = invoiceStore.getters;
  const {currentCompany} = peopleStore.getters;
  const {colors: themeColors} = themeStore.getters;

  const brandColors = useMemo(
    () =>
      resolveThemePalette(
        {...themeColors, ...(currentCompany?.theme?.colors || {})},
        colors,
      ),
    [currentCompany?.id, themeColors],
  );

  const invoice = useMemo(() => {
    if (getEntityId(storeInvoice) === invoiceId) {
      return storeInvoice;
    }

    return null;
  }, [invoiceId, storeInvoice]);

  const statusColor = useMemo(
    () => resolveStatusColor(invoice),
    [invoice],
  );

  useEffect(() => {
    navigation.setOptions({
      title: invoiceId ? `Invoice #${invoiceId}` : 'Detalhe da invoice',
    });
  }, [invoiceId, navigation]);

  useEffect(() => {
    if (
      invoiceId &&
      typeof invoiceStore.actions?.get === 'function' &&
      getEntityId(storeInvoice) !== invoiceId
    ) {
      invoiceStore.actions.get(invoiceId).catch(() => null);
    }
  }, [invoiceId, invoiceStore.actions, storeInvoice]);

  const rows = useMemo(
    () => [
      {
        label: global.t?.t('orders', 'label', 'description') || 'Descrição',
        value: invoice?.description || '-',
      },
      {
        label: global.t?.t('orders', 'label', 'payer') || 'Pagador',
        value: getPartyLabel(invoice?.payer),
      },
      {
        label: global.t?.t('orders', 'label', 'receiver') || 'Recebedor',
        value: getPartyLabel(invoice?.receiver),
      },
      {
        label:
          global.t?.t('invoice', 'label', 'sourceWallet') || 'Carteira origem',
        value: invoice?.sourceWallet?.wallet || '-',
      },
      {
        label:
          global.t?.t('invoice', 'label', 'destinationWallet') ||
          'Carteira destino',
        value: invoice?.destinationWallet?.wallet || '-',
      },
      {
        label:
          global.t?.t('orders', 'label', 'paymentMethod') ||
          'Forma de pagamento',
        value:
          invoice?.paymentType?.paymentType ||
          invoice?.paymentType?.name ||
          '-',
      },
      {
        label: global.t?.t('invoice', 'label', 'dueDate') || 'Vencimento',
        value: Formatter.formatDateYmdTodmY(invoice?.dueDate) || '-',
      },
    ],
    [invoice],
  );

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeArea, {backgroundColor: brandColors.background}]}>
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
          <View
            style={[
              styles.heroCard,
              {backgroundColor: '#FFFFFF', borderColor: withOpacity(statusColor, 0.24)},
            ]}>
            <View style={styles.heroTopRow}>
              <Text style={styles.invoiceIdText}>Invoice #{invoiceId}</Text>
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

            <Text style={[styles.amountText, {color: brandColors.primary}]}>
              {Formatter.formatMoney(invoice?.price || 0)}
            </Text>

            {linkedOrderAmount > 0 && (
              <Text style={styles.heroMetaText}>
                Valor deste pedido na invoice: {Formatter.formatMoney(linkedOrderAmount)}
              </Text>
            )}

            {linkedOrderId ? (
              <Text style={styles.heroMetaText}>Pedido vinculado: #{linkedOrderId}</Text>
            ) : null}
          </View>

          <View style={styles.detailsCard}>
            {rows.map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  invoiceIdText: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '900',
  },
  heroMetaText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default InvoiceDetailsPage;
