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
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useStore } from '@store';
import DefaultExternalFilters from '@controleonline/ui-default/src/react/components/filters/DefaultExternalFilters';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import {
  formatStoreColumnLabel,
  formatStoreColumnValue,
} from '@controleonline/ui-common/src/react/utils/storeColumns';
import { getDateRange } from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import { colors } from '@controleonline/../../src/styles/colors';
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';
import { createStyles } from './FinancialEntriesPage.styles';

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

const getStatusLabel = status => global.t?.t('invoice', 'label', status) || status || '-';

const getPersonName = entity => {
  if (!entity) return '-';
  if (typeof entity === 'string') return entity;
  if (typeof entity === 'object') return entity?.name || entity?.alias || String(entity?.id || '-');
  return '-';
};

const getPartyLabel = (invoice, mode) => {
  if (mode === 'receivables') return getPersonName(invoice?.payer);
  if (mode === 'payables') return invoice?.sourceWallet?.wallet || '-';
  return invoice?.sourceWallet?.wallet || '-';
};

const getSecondaryPartyLabel = (invoice, mode) => {
  if (mode === 'receivables') return invoice?.destinationWallet?.wallet || '-';
  if (mode === 'payables') return getPersonName(invoice?.receiver);
  return invoice?.destinationWallet?.wallet || '-';
};

const invoiceBelongsToCompany = (invoice, mode, companyId) => {
  const currentCompanyId = Number(companyId);
  if (!currentCompanyId) return false;

  const payerId = getEntityId(invoice?.payer);
  const receiverId = getEntityId(invoice?.receiver);

  if (mode === 'receivables') return receiverId === currentCompanyId;
  if (mode === 'payables') return payerId === currentCompanyId;
  return payerId === currentCompanyId && receiverId === currentCompanyId;
};

const normalizeMoneyValue = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const rawValue = String(value ?? '').trim();
  if (!rawValue) return 0;

  const sanitizedValue = rawValue.replace(/[^0-9,.-]/g, '');
  const normalizedValue = sanitizedValue.includes(',')
    ? sanitizedValue.replace(/\./g, '').replace(',', '.')
    : sanitizedValue;
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const resolveInvoiceAmount = invoice =>
  normalizeMoneyValue(invoice?.price ?? invoice?.value ?? invoice?.amount ?? invoice?.total);

const normalizeInvoiceType = invoice =>
  String(invoice?.invoiceType || invoice?.invoice_type || 'invoice')
    .trim()
    .toLowerCase() || 'invoice';

const isRealInvoice = invoice => normalizeInvoiceType(invoice) === 'invoice';

const getOpenAmountTranslationKey = mode => {
  if (mode === 'payables') return 'payableAmount';
  if (mode === 'ownTransfers') return 'transferAmount';
  return 'receivableAmount';
};

const DEFAULT_FINANCIAL_DATE_FILTER = {
  shortcut: '30d',
  customRange: { from: '', to: '' },
};

const normalizeText = value => String(value || '').trim();

const getColumnKey = column => column?.key || column?.name || '';

const normalizeFilterValue = value => {
  if (value && typeof value === 'object') {
    return normalizeFilterValue(value.value ?? value.id ?? value['@id'] ?? '');
  }

  return normalizeText(value);
};

const isFilledFilterValue = value => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') {
    return Object.values(value).some(isFilledFilterValue);
  }

  return normalizeText(value) !== '';
};

const resolveDueDateState = filterValue => {
  if (!filterValue || typeof filterValue !== 'object') {
    return {
      customRange: { from: '', to: '' },
      value: 'all',
    };
  }

  if (filterValue.shortcut) {
    return {
      customRange: filterValue.customRange || { from: '', to: '' },
      value: filterValue.shortcut,
    };
  }

  if (filterValue.start || filterValue.end || filterValue.after || filterValue.before) {
    return {
      customRange: {
        from: filterValue.start || filterValue.after || '',
        to: filterValue.end || filterValue.before || '',
      },
      value: 'custom',
    };
  }

  return {
    customRange: { from: '', to: '' },
    value: 'all',
  };
};

function FinancialEntriesPage({ mode = 'receivables', toolbarActions = [] }) {
  const navigation = useNavigation();

  const invoiceStore = useStore('invoice');
  const peopleStore = useStore('people');
  const statusStore = useStore('status');
  const categoriesStore = useStore('categories');
  const walletStore = useStore('wallet');
  const paymentTypeStore = useStore('paymentType');
  const themeStore = useStore('theme');

  const { getters: invoiceGetters, actions: invoiceActions } = invoiceStore;
  const { getters: peopleGetters, actions: peopleActions } = peopleStore;
  const { getters: statusGetters, actions: statusActions } = statusStore;
  const { getters: categoriesGetters, actions: categoriesActions } = categoriesStore;
  const { getters: walletGetters, actions: walletActions } = walletStore;
  const { getters: paymentTypeGetters, actions: paymentTypeActions } = paymentTypeStore;
  const { currentCompany } = peopleGetters;
  const { colors: themeColors } = themeStore.getters;
  const themeTokens = useMemo(
    () => ({...themeColors, ...(currentCompany?.theme?.colors || {})}),
    [currentCompany?.theme?.colors, themeColors],
  );

  // Referências estáveis para as actions — evita que mudanças de referência
  // nas actions do store disparem efeitos em cascata desnecessários
  const actionsRef = useRef({});
  actionsRef.current = {
    invoiceActions,
    statusActions,
    walletActions,
    paymentTypeActions,
    categoriesActions,
    peopleActions,
  };

  const { items: invoices, isLoading, summary: invoiceSummary, totalItems } = invoiceGetters;
  const invoiceColumns = useMemo(
    () => (Array.isArray(invoiceGetters?.columns) ? invoiceGetters.columns : []),
    [invoiceGetters?.columns],
  );
  const storeFilters = invoiceGetters?.filters || {};
  const storeFiltersKey = useMemo(
    () => JSON.stringify(storeFilters || {}),
    [storeFilters],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [loadedInvoices, setLoadedInvoices] = useState([]);
  const [sortState, setSortState] = useState(null);

  const mountedRef = useRef(false);
  const defaultDateFilterScopeRef = useRef('');

  useEffect(() => {
    if (!currentCompany?.id) return;

    const { statusActions: sa, walletActions: wa, paymentTypeActions: pta, categoriesActions: ca, peopleActions: pa } = actionsRef.current;

    sa.getItems({ context: 'invoice' });
    wa.getItems({ people: currentCompany.id });
    pta.getItems({ context: 'invoice', people: currentCompany.id });
    ca.getItems({
      context: mode === 'payables' ? 'payer' : 'receiver',
      people: currentCompany.id,
    });
    pa.getItems({
      context: mode === 'payables' ? 'payer' : 'receiver',
      people: currentCompany.id,
    });
    // Apenas currentCompany?.id e mode como deps — as actions são lidas via ref
    // para não disparar o efeito em cascata a cada re-render do store
  }, [currentCompany?.id, mode]);

  const brandColors = useMemo(
    () =>
      resolveThemePalette(
        themeTokens,
        colors,
      ),
    [themeTokens],
  );
  const styles = useMemo(() => createStyles(brandColors), [brandColors]);
  const tableAccentColor = brandColors.primary || brandColors.text;
  const tableSurfaceColor = brandColors.background || brandColors.white;
  const tableTextColor = brandColors.secondary || brandColors.text;
  const tableMutedColor = brandColors.textSecondary;

  const statusOptions = useMemo(
    () => (statusGetters.items || []).filter(item => !item.context || item.context === 'invoice'),
    [statusGetters.items],
  );
  const categoryOptions = useMemo(() => categoriesGetters.items || [], [categoriesGetters.items]);
  const walletOptions = useMemo(() => walletGetters.items || [], [walletGetters.items]);
  const paymentTypeOptions = useMemo(() => paymentTypeGetters.items || [], [paymentTypeGetters.items]);
  const receiverOptions = useMemo(
    () =>
      (peopleGetters.items || []).filter(item => Number(item?.id) !== Number(currentCompany?.id)),
    [peopleGetters.items, currentCompany?.id],
  );

  const getOptionsForColumn = useCallback(
    column => {
      const key = getColumnKey(column);
      if (key === 'status') return statusOptions;
      if (key === 'category') return categoryOptions;
      if (key === 'sourceWallet' || key === 'destinationWallet' || key === 'wallet') return walletOptions;
      if (key === 'paymentType') return paymentTypeOptions;
      if (key === 'payer' || key === 'receiver') return receiverOptions;
      return [];
    },
    [categoryOptions, paymentTypeOptions, receiverOptions, statusOptions, walletOptions],
  );

  const setStoreFilters = useCallback(nextFilters => {
    actionsRef.current.invoiceActions.setFilters(nextFilters || {});
  }, []);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const scopeKey = `${currentCompany.id}:${mode}`;
    if (defaultDateFilterScopeRef.current === scopeKey) {
      return;
    }

    defaultDateFilterScopeRef.current = scopeKey;

    const dueDateState = resolveDueDateState(storeFilters?.dueDate);
    if (dueDateState.value !== 'all') {
      return;
    }

    setStoreFilters({
      ...(storeFilters || {}),
      dueDate: DEFAULT_FINANCIAL_DATE_FILTER,
    });
  }, [currentCompany?.id, mode, setStoreFilters, storeFilters]);

  const formatInvoiceColumnLabel = useCallback(
    (fieldName, fallbackLabel) =>
      fallbackLabel ||
      formatStoreColumnLabel({
        columns: invoiceColumns,
        fallbackLabel,
        fieldName,
        storeName: 'invoice',
      }) || fallbackLabel,
    [invoiceColumns],
  );

  const formatInvoiceColumnValue = useCallback(
    (row, fieldName, fallbackValue) => {
      const formattedValue = formatStoreColumnValue({
        columns: invoiceColumns,
        fieldName,
        row,
        storeName: 'invoice',
        value: row?.[fieldName],
      });

      return formattedValue ?? fallbackValue ?? '-';
    },
    [invoiceColumns],
  );

  const fetchInvoices = useCallback((pageOverride) => {
    if (!currentCompany?.id) return;

    const page = pageOverride || currentPage;
    const params = {};
    params.page = page;
    params.itemsPerPage = itemsPerPage;
    if (sortState?.field && sortState?.direction) {
      params[`order[${sortState.field}]`] = sortState.direction;
    }

    Object.entries(storeFilters || {}).forEach(([key, value]) => {
      if (!isFilledFilterValue(value)) return;

      if (key === 'dueDate') {
        const dateState = resolveDueDateState(value);
        const dateRange = getDateRange(dateState.value, dateState.customRange, {
          relativeMode: 'rolling',
          useCurrentMoment: true,
        });
        if (dateRange?.after) params['dueDate[after]'] = dateRange.after;
        if (dateRange?.before) params['dueDate[before]'] = dateRange.before;
        return;
      }

      if (Array.isArray(value)) {
        params[key] = value.map(normalizeFilterValue);
        return;
      }

      params[key] = normalizeFilterValue(value);
    });

    if (mode === 'receivables') {
      params.receiver = currentCompany.id;
      params.excludeOwnTransfers = 1;
    } else if (mode === 'payables') {
      params.payer = currentCompany.id;
      params.excludeOwnTransfers = 1;
    } else {
      params.payer = currentCompany.id;
      params.receiver = currentCompany.id;
      params.ownTransfers = 1;
    }

    params.invoiceType = 'invoice';

    actionsRef.current.invoiceActions.getItems(params);
  }, [
    currentCompany?.id,
    currentPage,
    itemsPerPage,
    mode,
    sortState?.direction,
    sortState?.field,
    storeFiltersKey,
    // invoiceActions removido — lido via ref para referência estável
  ]);

  // Ref que sempre aponta para a versão mais recente de fetchInvoices.
  // Permite que o efeito com debounce chame a versão atualizada sem precisar
  // incluir fetchInvoices nas suas deps (o que causaria disparo duplo junto
  // com o useFocusEffect).
  const fetchInvoicesRef = useRef(fetchInvoices);
  useEffect(() => {
    fetchInvoicesRef.current = fetchInvoices;
  }, [fetchInvoices]);

  useEffect(() => {
    setCurrentPage(1);
    setLoadedInvoices([]);
  }, [currentCompany?.id, mode, sortState?.direction, sortState?.field]);

  useEffect(() => {
    if (!Array.isArray(invoices)) return;

    const scopedInvoices = invoices.filter(invoice =>
      invoiceBelongsToCompany(invoice, mode, currentCompany?.id) &&
      isRealInvoice(invoice),
    );

    if (currentPage === 1) {
      setLoadedInvoices(scopedInvoices);
      return;
    }

    setLoadedInvoices(prev => {
      const incomingIds = new Set(scopedInvoices.map(item => item.id));
      const filteredPrev = prev.filter(item => !incomingIds.has(item.id));
      return [...filteredPrev, ...scopedInvoices];
    });
  }, [invoices, currentPage, currentCompany?.id, mode]);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices]),
  );

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      setLoadedInvoices([]);
      fetchInvoicesRef.current(1);
    }, 180);

    return () => clearTimeout(timeout);
  }, [
    currentCompany?.id,
    mode,
    sortState?.direction,
    sortState?.field,
    storeFiltersKey,
    // fetchInvoices removido — lido via ref para evitar disparo duplo
    // quando useFocusEffect já chamou fetchInvoices no mesmo ciclo
  ]);

  useEffect(() => {
    if (!mountedRef.current || currentPage === 1) return;
    fetchInvoicesRef.current(currentPage);
  }, [currentPage]);

  const filteredInvoices = useMemo(() => {
    if (mode === 'ownTransfers') return (loadedInvoices || []).filter(isRealInvoice);

    return (loadedInvoices || []).filter(invoice => {
      const payerId = getEntityId(invoice?.payer);
      const receiverId = getEntityId(invoice?.receiver);
      return (
        !(payerId && receiverId && payerId === receiverId) &&
        isRealInvoice(invoice)
      );
    });
  }, [loadedInvoices, mode]);

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
    const standardFilteredTotal = normalizeMoneyValue(nextSummary?.sum?.price);

    if (hasStandardFilteredTotal) {
      nextSummary.financial = {
        ...(nextSummary?.financial || {}),
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

  const summaryLabels = (() => {
    const openAmountLabel = global.t?.t(
      'invoice',
      'label',
      getOpenAmountTranslationKey(mode),
    );

    return {
      'financial.totalAmount': global.t?.t('invoice', 'label', 'totalAmount'),
      'financial.open': openAmountLabel,
      'financial.openAmount': openAmountLabel,
      'financial.pendingAmount': openAmountLabel,
      'financial.receivableAmount': openAmountLabel,
      'financial.paid': global.t?.t('invoice', 'label', 'paidAmount'),
      'financial.paidAmount': global.t?.t('invoice', 'label', 'paidAmount'),
    };
  })();

  const hasMoreInvoices = loadedInvoices.length < Number(totalItems || 0);

  const mergeSavedInvoice = useCallback(savedInvoice => {
    if (!savedInvoice?.id && !savedInvoice?.['@id']) return;
    if (!invoiceBelongsToCompany(savedInvoice, mode, currentCompany?.id)) return;
    if (!isRealInvoice(savedInvoice)) return;

    const savedId = getEntityId(savedInvoice);
    setLoadedInvoices(prev => {
      const currentItems = prev || [];
      const hasExistingInvoice = currentItems.some(invoice => getEntityId(invoice) === savedId);

      if (!hasExistingInvoice) return [savedInvoice, ...currentItems];

      return currentItems.map(invoice =>
        getEntityId(invoice) === savedId
          ? { ...invoice, ...savedInvoice }
          : invoice,
      );
    });
  }, [currentCompany?.id, mode]);

  const openInvoiceDetails = useCallback(invoice => {
    const invoiceId = String(invoice?.id || invoice?.['@id'] || '').replace(/\D/g, '');
    if (!invoiceId) return;

    navigation.navigate('InvoiceDetailsPage', { id: invoiceId });
  }, [navigation]);

  const renderInvoiceCard = ({ item, renderField, openRow }) => {
    const statusColor = item?.status?.color;
    const amountValue = formatInvoiceColumnValue(
      item,
      'price',
      Formatter.formatMoney(resolveInvoiceAmount(item)),
    );
    const renderCardField = (fieldName, fallback, options = {}) =>
      renderField?.(fieldName, {
        displayValue: fallback,
        numberOfLines: 1,
        readTextStyle: styles.invoiceValue,
        ...options,
      }) || (
        <Text style={options.readTextStyle || styles.invoiceValue} numberOfLines={options.numberOfLines || 1}>
          {fallback}
        </Text>
      );

    return (
      <TouchableOpacity
        style={[styles.invoiceCard, {backgroundColor: tableSurfaceColor}]}
        activeOpacity={0.84}
        onPress={openRow || (() => openInvoiceDetails(item))}>
        <View style={styles.invoiceTopRow}>
          <Text style={[styles.invoiceId, {color: tableTextColor}]}>#{item.id}</Text>
          <View style={[styles.statusChip, { backgroundColor: withOpacity(statusColor, 0.14), borderColor: statusColor }]}>
            <Text style={[styles.statusChipText, { color: statusColor }]}>{getStatusLabel(item?.status?.status)}</Text>
          </View>
        </View>

        <View style={styles.invoiceInfoGrid}>
          <View style={styles.invoiceInfoCell}>
            <Text style={[styles.invoiceLabel, {color: tableMutedColor}]}>
              {mode === 'receivables'
                ? formatInvoiceColumnLabel('payer', global.t?.t('invoice', 'label', 'payer'))
                : formatInvoiceColumnLabel('sourceWallet', global.t?.t('invoice', 'label', 'sourceWallet'))}
            </Text>
            <Text style={[styles.invoiceValue, {color: tableTextColor}]} numberOfLines={1}>{getPartyLabel(item, mode)}</Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={[styles.invoiceLabel, {color: tableMutedColor}]}>
              {mode === 'receivables'
                ? formatInvoiceColumnLabel('destinationWallet', global.t?.t('invoice', 'label', 'destinationWallet'))
                : formatInvoiceColumnLabel('receiver', global.t?.t('invoice', 'label', 'receiver'))}
            </Text>
            <Text style={[styles.invoiceValue, {color: tableTextColor}]} numberOfLines={1}>{getSecondaryPartyLabel(item, mode)}</Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={[styles.invoiceLabel, {color: tableMutedColor}]}>
              {formatInvoiceColumnLabel('category', global.t?.t('invoice', 'label', 'category'))}
            </Text>
            {renderCardField('category', formatInvoiceColumnValue(
              item,
              'category',
              item?.category?.name || item?.categories?.category || '-',
            ))}
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={[styles.invoiceLabel, {color: tableMutedColor}]}>
              {formatInvoiceColumnLabel('dueDate', global.t?.t('invoice', 'label', 'dueDate'))}
            </Text>
            {renderCardField('dueDate', formatInvoiceColumnValue(
              item,
              'dueDate',
              Formatter.formatDateYmdTodmY(item?.dueDate),
            ))}
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={[styles.invoiceLabel, {color: tableMutedColor}]}>
              {formatInvoiceColumnLabel('paymentType', global.t?.t('invoice', 'label', 'paymentType'))}
            </Text>
            {renderCardField('paymentType', formatInvoiceColumnValue(
              item,
              'paymentType',
              item?.paymentType?.paymentType || '-',
            ))}
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={[styles.invoiceLabel, {color: tableMutedColor}]}>
              {formatInvoiceColumnLabel('installments', global.t?.t('invoice', 'label', 'installments'))}
            </Text>
            {renderCardField('installments', formatInvoiceColumnValue(
              item,
              'installments',
              item?.installments || '-',
            ))}
          </View>
        </View>

        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, {color: tableMutedColor}]}>
            {formatInvoiceColumnLabel('price', global.t?.t('invoice', 'label', 'value'))}
          </Text>
          {renderCardField('price', amountValue, {
            containerStyle: styles.amountField,
            readTextStyle: [styles.amountValue, { color: tableTextColor }],
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: brandColors.background }]}>
      <View style={styles.filterBar}>
        <DefaultExternalFilters
          accentColor={tableAccentColor}
          columns={invoiceColumns}
          filters={storeFilters}
          getOptionsForColumn={getOptionsForColumn}
          onChangeFilters={setStoreFilters}
          storeName="invoice"
        />
      </View>

      <DefaultTable
        accentColor={tableAccentColor}
        actions={invoiceActions}
        columns={invoiceColumns}
        data={filteredInvoices}
        filters={storeFilters}
        forceCardsOnCompact={false}
        getOptionsForColumn={getOptionsForColumn}
        hasMore={hasMoreInvoices}
        isLoading={isLoading}
        onFilterChange={setStoreFilters}
        onRowPress={openInvoiceDetails}
        onSortChange={setSortState}
        renderCard={renderInvoiceCard}
        searchProps={{
          filters: storeFilters,
          onChangeFilters: setStoreFilters,
          placeholder: global.t?.t('invoice', 'input', 'search'),
        }}
        showTotalItemsInFooter={false}
        showTotalItemsInCompactToolbar
        summary={filteredSummary}
        summaryLabels={summaryLabels}
        sort={sortState}
        storeName="invoice"
        onEndReached={() => {
          if (!isLoading && hasMoreInvoices) {
            setCurrentPage(page => page + 1);
          }
        }}
        onSaved={mergeSavedInvoice}
        toolbarActions={toolbarActions}
      />

    </View>
  );
}

export default FinancialEntriesPage;
