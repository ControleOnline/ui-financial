/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - `ui-financial` e o modulo React das telas financeiras.
 * - Esta pagina e a referencia de listagem e navegacao de lancamentos financeiros.
 *
 * ## Estado
 *
 * ## Limites
 * - Nao duplicar calculos financeiros fora do dono desta tela.
 * - Manter aqui apenas a coordenacao da apresentacao e dos filtros financeiros.
 */
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@store';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import { resolveThemePalette } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import { createStyles } from './FinancialEntriesPage.styles';

const DEFAULT_FINANCIAL_DATE_FILTER = {
  shortcut: '30d',
  customRange: { from: '', to: '' },
};

const normalizeText = value => String(value || '').trim();

const translate = (store, type, key) => global.t?.t(store, type, key);

const resolveVisibleColumnsPreferenceKey = mode =>
  `financialEntries:${normalizeText(mode) || 'receivables'}`;

const resolveInvoiceRequestParams = ({ companyId, mode }) => {
  const params = {
    invoiceType: 'invoice',
  };

  if (!companyId) {
    return params;
  }

  if (mode === 'payables') {
    params.payer = companyId;
    params.excludeOwnTransfers = 1;
    return params;
  }

  if (mode === 'ownTransfers') {
    params.payer = companyId;
    params.receiver = companyId;
    params.ownTransfers = 1;
    return params;
  }

  params.receiver = companyId;
  params.excludeOwnTransfers = 1;
  return params;
};

function FinancialEntriesPage({ mode = 'receivables', toolbarActions = [] }) {
  const navigation = useNavigation();
  const invoiceStore = useStore('invoice');
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const authStore = useStore('auth');
  const translateStore = useStore('translate');

  const { getters: invoiceGetters } = invoiceStore;
  const { getters: peopleGetters } = peopleStore;
  const { getters: themeGetters } = themeStore;
  const { getters: authGetters } = authStore;
  const translateMessages = translateStore?.getters?.messages || {};
  const pendingTranslateMessages = translateStore?.getters?.pendingMessages || {};

  const { currentCompany } = peopleGetters || {};
  const { colors: themeColors } = themeGetters || {};
  const { sessionChecked } = authGetters || {};

  const themeTokens = useMemo(
    () => ({ ...themeColors, ...(currentCompany?.theme?.colors || {}) }),
    [currentCompany?.theme?.colors, themeColors],
  );
  const brandColors = useMemo(
    () => resolveThemePalette(themeTokens, colors),
    [themeTokens],
  );
  const styles = useMemo(() => createStyles(brandColors), [brandColors]);
  const visibleColumnsPreferenceKey = useMemo(
    () => resolveVisibleColumnsPreferenceKey(mode),
    [mode],
  );
  const storeFilters = invoiceGetters?.filters || {};
  const initialFilters = useMemo(
    () =>
      Object.keys(storeFilters || {}).length > 0
        ? storeFilters
        : { dueDate: DEFAULT_FINANCIAL_DATE_FILTER },
    [storeFilters],
  );
  const requestParams = useMemo(
    () => resolveInvoiceRequestParams({ companyId: currentCompany?.id, mode }),
    [currentCompany?.id, mode],
  );
  const isBootstrapReady = Boolean(sessionChecked) && Boolean(currentCompany?.id) && Boolean(themeColors);

  const openInvoiceDetails = useCallback(
    invoice => {
      const invoiceId = String(invoice?.id || invoice?.['@id'] || '').replace(/\D/g, '');
      if (!invoiceId) return;

      navigation.navigate('InvoiceDetailsPage', { id: invoiceId });
    },
    [navigation],
  );

  const invoiceSummary = invoiceGetters?.summary;
  const filteredSummary = useMemo(() => {
    if (!invoiceSummary || typeof invoiceSummary !== 'object' || Array.isArray(invoiceSummary)) {
      return invoiceSummary;
    }

    const nextSummary = { ...invoiceSummary };
    const hasStandardFilteredTotal =
      nextSummary?.sum &&
      typeof nextSummary.sum === 'object' &&
      !Array.isArray(nextSummary.sum) &&
      Object.prototype.hasOwnProperty.call(nextSummary.sum, 'price');
    const standardFilteredTotal = Number(nextSummary?.sum?.price || 0);

    if (hasStandardFilteredTotal) {
      nextSummary.financial = {
        ...(nextSummary.financial || {}),
        totalAmount: standardFilteredTotal,
      };
    }

    if (nextSummary?.sum && typeof nextSummary.sum === 'object' && !Array.isArray(nextSummary.sum)) {
      const sumWithoutPrice = { ...nextSummary.sum };
      delete sumWithoutPrice.price;
      if (Object.keys(sumWithoutPrice).length > 0) {
        nextSummary.sum = sumWithoutPrice;
      } else {
        delete nextSummary.sum;
      }
    }

    if (Object.prototype.hasOwnProperty.call(nextSummary, 'price')) {
      delete nextSummary.price;
    }

    return nextSummary;
  }, [invoiceSummary]);

  const summaryLabels = useMemo(() => {
    const openAmountLabel = translate(
      'invoice',
      'label',
      mode === 'payables'
        ? 'payableAmount'
        : mode === 'ownTransfers'
          ? 'transferAmount'
          : 'receivableAmount',
    );

    return {
      'financial.totalAmount': translate('invoice', 'label', 'totalAmount'),
      'financial.open': openAmountLabel,
      'financial.openAmount': openAmountLabel,
      'financial.pendingAmount': openAmountLabel,
      'financial.receivableAmount': openAmountLabel,
      'financial.paid': translate('invoice', 'label', 'paidAmount'),
      'financial.paidAmount': translate('invoice', 'label', 'paidAmount'),
    };
  }, [mode, translateMessages, pendingTranslateMessages]);

  if (!isBootstrapReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brandColors.primary || '#2563EB'} />
      </View>
    );
  }

  if (!currentCompany?.id) {
    return (
      <View style={styles.container}>
        <Text>Empresa nao identificada.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: brandColors.background || '#F8FAFC' }]}
      edges={['bottom']}
    >
      <View style={{ flex: 1 }}>
        <DefaultTable
          accentColor={brandColors.primary}
          add={false}
          filters={initialFilters}
          onRowPress={openInvoiceDetails}
          requestParams={requestParams}
          searchProps={{
            placeholder: translate('invoice', 'input', 'search'),
          }}
          showTotalItemsInFooter
          showTotalItemsInCompactToolbar
          summary={filteredSummary}
          summaryLabels={summaryLabels}
          toolbarActions={toolbarActions}
          visibleColumnsPreferenceKey={visibleColumnsPreferenceKey}
          sort={{
            direction: 'desc',
            field: 'dueDate',
          }}
          storeName="invoice"
        />
      </View>
    </SafeAreaView>
  );
}

export default FinancialEntriesPage;
