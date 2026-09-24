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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import DefaultForm from '@controleonline/ui-default/src/react/components/form/DefaultForm';
import { resolveThemePalette } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import { createStyles } from './FinancialEntriesPage.styles';
import {
  resolveCreateRowDefaults,
  resolveCreateColumns,
} from './financialEntriesCreateHelpers';

const DEFAULT_FINANCIAL_DATE_FILTER = {
  shortcut: 'today',
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
  const defaultFiltersAppliedRef = useRef(false);
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const createRowDefaults = useMemo(
    () => resolveCreateRowDefaults({ company: currentCompany, mode }),
    [currentCompany, mode],
  );

  const createColumns = useMemo(
    () => resolveCreateColumns(invoiceGetters?.columns || [], mode),
    [invoiceGetters?.columns, mode],
  );


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
      storeFilters?.dueDate
        ? storeFilters
        : { ...(storeFilters || {}), dueDate: DEFAULT_FINANCIAL_DATE_FILTER },
    [storeFilters],
  );
  const requestParams = useMemo(
    () => resolveInvoiceRequestParams({ companyId: currentCompany?.id, mode }),
    [currentCompany?.id, mode],
  );
  const isBootstrapReady = Boolean(sessionChecked) && Boolean(currentCompany?.id) && Boolean(themeColors);
  const shouldApplyDefaultFilters =
    isBootstrapReady &&
    !defaultFiltersAppliedRef.current &&
    !storeFilters?.dueDate;

  useEffect(() => {
    if (!isBootstrapReady || defaultFiltersAppliedRef.current) {
      return;
    }

    defaultFiltersAppliedRef.current = true;

    if (!storeFilters?.dueDate) {
      invoiceStore.actions.setFilters(initialFilters);
    }
  }, [initialFilters, invoiceStore.actions, isBootstrapReady, storeFilters]);

  const handleAdd = useCallback(() => {
    if (!currentCompany?.id) {
      return;
    }
    setIsCreateModalOpen(true);
  }, [currentCompany?.id]);

  const handleCreateCancel = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSaved = useCallback(
    async (_savedItem) => {
      setIsCreateModalOpen(false);
      // Refresh list with current request params / filters so the new entry appears
      if (typeof invoiceStore?.actions?.getItems === 'function') {
        try {
          await invoiceStore.actions.getItems({
            ...requestParams,
            ...(invoiceGetters?.filters || {}),
          });
        } catch (_err) {
          // List refresh is best-effort; save already succeeded
        }
      }
    },
    [invoiceGetters?.filters, invoiceStore?.actions, requestParams],
  );

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

  if (shouldApplyDefaultFilters) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brandColors.primary || '#2563EB'} />
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
          filters={initialFilters}
          onAdd={handleAdd}
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

      <Modal
        transparent
        visible={isCreateModalOpen}
        animationType="fade"
        onRequestClose={handleCreateCancel}
      >
        <TouchableWithoutFeedback onPress={handleCreateCancel}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: brandColors.background || '#FFFFFF',
                  borderRadius: 12,
                  maxHeight: '90%',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E2E8F0',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: brandColors.text || '#0F172A',
                    }}
                  >
                    {mode === 'payables'
                      ? translate('invoice', 'label', 'newPayable') || 'Novo contas a pagar'
                      : mode === 'ownTransfers'
                        ? translate('invoice', 'label', 'newTransfer') || 'Nova transferência'
                        : translate('invoice', 'label', 'newReceivable') || 'Novo contas a receber'}
                  </Text>
                  <TouchableOpacity onPress={handleCreateCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="x" size={20} color={brandColors.textSecondary || '#64748B'} />
                  </TouchableOpacity>
                </View>
                <DefaultForm
                  mode="create"
                  storeName="invoice"
                  columns={createColumns}
                  row={createRowDefaults}
                  actions={{
                    save: payload => invoiceStore.actions.save(payload),
                  }}
                  onCancel={handleCreateCancel}
                  onSaved={handleCreateSaved}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

export default FinancialEntriesPage;
