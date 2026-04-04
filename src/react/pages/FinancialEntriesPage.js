import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import { colors } from '@controleonline/../../src/styles/colors';
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';

const MODE_CONFIG = {
  receivables: {
    title: 'Recebiveis',
    accent: '#22C55E',
  },
  payables: {
    title: 'Pagaveis',
    accent: '#EF4444',
  },
  ownTransfers: {
    title: 'Transferencias proprias',
    accent: '#8B5CF6',
  },
};

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

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

const getPartyLabel = (invoice, mode) => {
  if (mode === 'receivables') return invoice?.receiver || '-';
  if (mode === 'payables') return invoice?.destinationWallet?.wallet || '-';
  return invoice?.sourceWallet?.wallet || invoice?.originWallet?.wallet || '-';
};

const getSecondaryPartyLabel = (invoice, mode) => {
  if (mode === 'receivables') return invoice?.destinationWallet?.wallet || '-';
  if (mode === 'payables') return invoice?.originWallet?.wallet || '-';
  return invoice?.destinationWallet?.wallet || '-';
};

const SelectModal = ({
  visible,
  title,
  options,
  selectedId,
  onClose,
  onSelect,
  labelKey,
  searchPlaceholder,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) setSearch('');
  }, [visible]);

  const filteredOptions = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    if (!term) return options;
    return (options || []).filter(item =>
      String(item?.[labelKey] || '')
        .toLowerCase()
        .includes(term),
    );
  }, [options, search, labelKey]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                  <Icon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalSearchRow}>
                <Icon name="search" size={14} color="#94A3B8" />
                <TextInput
                  style={styles.modalSearchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder || 'Buscar...'}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
                <TouchableOpacity
                  style={[styles.modalOption, !selectedId && styles.modalOptionActive]}
                  onPress={() => {
                    onSelect('');
                    onClose();
                  }}>
                  <Text style={[styles.modalOptionText, !selectedId && styles.modalOptionTextActive]}>
                    {global.t?.t('invoice', 'label', 'select') || 'Selecione'}
                  </Text>
                </TouchableOpacity>

                {filteredOptions.map(item => {
                  const id = String(item.id);
                  const selected = String(selectedId || '') === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.modalOption, selected && styles.modalOptionActive]}
                      onPress={() => {
                        onSelect(id);
                        onClose();
                      }}>
                      {!!item.color && <View style={[styles.modalOptionDot, { backgroundColor: item.color }]} />}
                      <Text style={[styles.modalOptionText, selected && styles.modalOptionTextActive]} numberOfLines={1}>
                        {String(item?.[labelKey] || '-')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const FilterSelectField = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.filterField} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.filterLabel}>{label}</Text>
    <View style={styles.filterValueRow}>
      <Text style={styles.filterValue} numberOfLines={1}>{value || (global.t?.t('invoice', 'label', 'select') || 'Selecione')}</Text>
      <Icon name="chevron-down" size={14} color="#64748B" />
    </View>
  </TouchableOpacity>
);

const FilterInputField = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View style={styles.filterField}>
    <Text style={styles.filterLabel}>{label}</Text>
    <TextInput
      style={styles.filterInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType={keyboardType || 'default'}
    />
  </View>
);

function FinancialEntriesPage({ mode = 'receivables' }) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.receivables;
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

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
  const { colors: themeColors } = themeStore.getters;

  const { items: invoices, isLoading } = invoiceGetters;
  const { currentCompany } = peopleGetters;

  const [idFilter, setIdFilter] = useState('');
  const [dueDateStart, setDueDateStart] = useState('');
  const [dueDateEnd, setDueDateEnd] = useState('');

  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [sourceWalletId, setSourceWalletId] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');

  const [activeModal, setActiveModal] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(!isMobile);

  const mountedRef = useRef(false);

  useEffect(() => {
    const stored = invoiceGetters?.filters || {};
    if (stored.id) setIdFilter(String(stored.id));
    if (stored.dueDate?.start) setDueDateStart(String(stored.dueDate.start));
    if (stored.dueDate?.end) setDueDateEnd(String(stored.dueDate.end));
  }, []);

  useEffect(() => {
    if (!currentCompany?.id) return;

    statusActions.getItems({ context: 'invoice' });

    if (mode === 'ownTransfers') {
      walletActions.getItems({ people: currentCompany.id });
      return;
    }

    walletActions.getItems({ people: currentCompany.id });
    paymentTypeActions.getItems({ context: 'invoice', people: currentCompany.id });
    categoriesActions.getItems({
      context: mode === 'payables' ? 'payer' : 'receiver',
      people: currentCompany.id,
    });
    peopleActions.getItems({
      context: mode === 'payables' ? 'payer' : 'receiver',
      people: currentCompany.id,
    });
  }, [
    currentCompany?.id,
    mode,
    statusActions,
    walletActions,
    paymentTypeActions,
    categoriesActions,
    peopleActions,
  ]);

  const brandColors = useMemo(
    () =>
      resolveThemePalette(
        { ...themeColors, ...(currentCompany?.theme?.colors || {}) },
        colors,
      ),
    [themeColors, currentCompany?.id],
  );

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

  const labelById = useCallback((items, id, key) => {
    if (!id) return '';
    const found = (items || []).find(item => String(item.id) === String(id));
    return found ? String(found[key] || '') : '';
  }, []);

  const normalizeDate = useCallback((value) => {
    const v = String(value || '').trim();
    if (!v) return null;

    const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;

    if (ddmmyyyy.test(v)) {
      const [, d, m, y] = v.match(ddmmyyyy);
      return `${y}-${m}-${d}`;
    }

    if (yyyymmdd.test(v)) {
      return v;
    }

    return null;
  }, []);

  const fetchInvoices = useCallback(() => {
    if (!currentCompany?.id) return;

    const params = {};

    if (idFilter) params.id = idFilter;
    if (selectedStatusId) params.status = selectedStatusId;

    const start = normalizeDate(dueDateStart);
    const end = normalizeDate(dueDateEnd);
    if (start) params['dueDate[after]'] = start;
    if (end) params['dueDate[before]'] = end;

    if (mode === 'receivables') {
      params.receiver = currentCompany.id;
      params.excludeOwnTransfers = 1;
      if (selectedReceiverId) params.payer = selectedReceiverId;
      if (selectedCategoryId) params.category = selectedCategoryId;
      if (selectedWalletId) params.destinationWallet = selectedWalletId;
      if (selectedPaymentTypeId) params.paymentType = selectedPaymentTypeId;
    } else if (mode === 'payables') {
      params.payer = currentCompany.id;
      params.excludeOwnTransfers = 1;
      if (selectedReceiverId) params.receiver = selectedReceiverId;
      if (selectedCategoryId) params.category = selectedCategoryId;
      if (selectedWalletId) params.sourceWallet = selectedWalletId;
      if (selectedPaymentTypeId) params.paymentType = selectedPaymentTypeId;
    } else {
      params.payer = currentCompany.id;
      params.receiver = currentCompany.id;
      params.ownTransfers = 1;
      if (sourceWalletId) params.sourceWallet = sourceWalletId;
      if (destinationWalletId) params.destinationWallet = destinationWalletId;
    }

    invoiceActions.getItems(params);
  }, [
    currentCompany?.id,
    idFilter,
    selectedStatusId,
    dueDateStart,
    dueDateEnd,
    mode,
    selectedReceiverId,
    selectedCategoryId,
    selectedWalletId,
    selectedPaymentTypeId,
    sourceWalletId,
    destinationWalletId,
    normalizeDate,
    invoiceActions,
  ]);

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
      fetchInvoices();
    }, 180);

    return () => clearTimeout(timeout);
  }, [
    idFilter,
    dueDateStart,
    dueDateEnd,
    selectedStatusId,
    selectedReceiverId,
    selectedCategoryId,
    selectedWalletId,
    selectedPaymentTypeId,
    sourceWalletId,
    destinationWalletId,
    fetchInvoices,
  ]);

  const filteredInvoices = useMemo(() => {
    if (mode === 'ownTransfers') return invoices || [];

    return (invoices || []).filter(invoice => {
      const payerId = getEntityId(invoice?.payer);
      const receiverId = getEntityId(invoice?.receiver);
      return !(payerId && receiverId && payerId === receiverId);
    });
  }, [invoices, mode]);

  const totals = useMemo(() => {
    const amount = filteredInvoices.reduce((sum, item) => sum + Number(item?.price || 0), 0);

    return {
      count: filteredInvoices.length,
      total: amount,
      paidCount: filteredInvoices.filter(item => String(item?.status?.status || '').toLowerCase() === 'paid').length,
    };
  }, [filteredInvoices]);

  const activeFiltersCount = useMemo(() => {
    const fields = [
      idFilter,
      dueDateStart,
      dueDateEnd,
      selectedStatusId,
      selectedCategoryId,
      selectedWalletId,
      selectedPaymentTypeId,
      selectedReceiverId,
      sourceWalletId,
      destinationWalletId,
    ];

    return fields.filter(value => String(value || '').trim() !== '').length;
  }, [
    idFilter,
    dueDateStart,
    dueDateEnd,
    selectedStatusId,
    selectedCategoryId,
    selectedWalletId,
    selectedPaymentTypeId,
    selectedReceiverId,
    sourceWalletId,
    destinationWalletId,
  ]);

  useEffect(() => {
    if (!isMobile) {
      setIsFiltersExpanded(true);
      return;
    }

    if (activeFiltersCount > 0) {
      setIsFiltersExpanded(false);
    }
  }, [activeFiltersCount, isMobile]);

  const renderInvoiceCard = ({ item }) => {
    const statusColor = item?.status?.color || '#94A3B8';

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceTopRow}>
          <Text style={styles.invoiceId}>#{item.id}</Text>
          <View style={[styles.statusChip, { backgroundColor: withOpacity(statusColor, 0.14), borderColor: statusColor }]}>
            <Text style={[styles.statusChipText, { color: statusColor }]}>{getStatusLabel(item?.status?.status)}</Text>
          </View>
        </View>

        <View style={styles.invoiceInfoGrid}>
          <View style={styles.invoiceInfoCell}>
            <Text style={styles.invoiceLabel}>
              {mode === 'receivables'
                ? global.t?.t('invoice', 'label', 'payer')
                : global.t?.t('invoice', 'label', 'originWallet')}
            </Text>
            <Text style={styles.invoiceValue} numberOfLines={1}>{getPartyLabel(item, mode)}</Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={styles.invoiceLabel}>
              {mode === 'receivables'
                ? global.t?.t('invoice', 'label', 'destinationWallet')
                : global.t?.t('invoice', 'label', 'receiver')}
            </Text>
            <Text style={styles.invoiceValue} numberOfLines={1}>{getSecondaryPartyLabel(item, mode)}</Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={styles.invoiceLabel}>{global.t?.t('invoice', 'label', 'category')}</Text>
            <Text style={styles.invoiceValue} numberOfLines={1}>
              {item?.category?.name || item?.categories?.category || '-'}
            </Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={styles.invoiceLabel}>{global.t?.t('invoice', 'label', 'dueDate')}</Text>
            <Text style={styles.invoiceValue}>{Formatter.formatDateYmdTodmY(item?.dueDate)}</Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={styles.invoiceLabel}>{global.t?.t('invoice', 'label', 'paymentType')}</Text>
            <Text style={styles.invoiceValue} numberOfLines={1}>{item?.paymentType?.paymentType || '-'}</Text>
          </View>

          <View style={styles.invoiceInfoCell}>
            <Text style={styles.invoiceLabel}>{global.t?.t('invoice', 'label', 'installments')}</Text>
            <Text style={styles.invoiceValue}>{item?.installments || '-'}</Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>{global.t?.t('invoice', 'label', 'value')}</Text>
          <Text style={[styles.amountValue, { color: brandColors.primary }]}>{Formatter.formatMoney(item?.price)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: brandColors.background }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Registros</Text>
          <Text style={styles.summaryValue}>{totals.count}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Com status pago</Text>
          <Text style={styles.summaryValue}>{totals.paidCount}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={[styles.summaryValue, { color: config.accent }]}>{Formatter.formatMoney(totals.total)}</Text>
        </View>
      </View>

      <View style={styles.filterCard}>
        {isMobile && (
          <TouchableOpacity
            style={styles.filterHeaderButton}
            activeOpacity={0.8}
            onPress={() => setIsFiltersExpanded(prev => !prev)}>
            <View style={styles.filterHeaderLeft}>
              <Text style={styles.filterHeaderTitle}>Filtros</Text>
              {activeFiltersCount > 0 && (
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </View>
            <Icon name={isFiltersExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
          </TouchableOpacity>
        )}

        {(!isMobile || isFiltersExpanded) && (
          <View style={styles.filterGrid}>
            <FilterInputField
              label={global.t?.t('invoice', 'label', 'id') || 'Id'}
              value={idFilter}
              onChangeText={setIdFilter}
              placeholder={global.t?.t('idInput', 'label', 'Insert id') || 'Inserir id'}
              keyboardType="number-pad"
            />

            <FilterSelectField
              label={global.t?.t('invoice', 'label', 'status') || 'Status'}
              value={labelById(statusOptions, selectedStatusId, 'status')}
              onPress={() => setActiveModal('status')}
            />

            <FilterInputField
              label={`${global.t?.t('invoice', 'label', 'dueDate') || 'Vencimento'} (inicio)`}
              value={dueDateStart}
              onChangeText={setDueDateStart}
              placeholder="DD/MM/AAAA"
            />

            <FilterInputField
              label={`${global.t?.t('invoice', 'label', 'dueDate') || 'Vencimento'} (fim)`}
              value={dueDateEnd}
              onChangeText={setDueDateEnd}
              placeholder="DD/MM/AAAA"
            />

            {mode !== 'ownTransfers' && (
              <>
                <FilterSelectField
                  label={mode === 'payables' ? 'Recebedor' : 'Pagador'}
                  value={labelById(receiverOptions, selectedReceiverId, 'name')}
                  onPress={() => setActiveModal('receiver')}
                />

                <FilterSelectField
                  label={global.t?.t('invoice', 'label', 'category') || 'Categoria'}
                  value={labelById(categoryOptions, selectedCategoryId, 'name')}
                  onPress={() => setActiveModal('category')}
                />

                <FilterSelectField
                  label={global.t?.t('invoice', 'label', 'wallet') || 'Carteira'}
                  value={labelById(walletOptions, selectedWalletId, 'wallet')}
                  onPress={() => setActiveModal('wallet')}
                />

                <FilterSelectField
                  label={global.t?.t('invoice', 'label', 'payment method') || 'Forma de pagamento'}
                  value={labelById(paymentTypeOptions, selectedPaymentTypeId, 'paymentType')}
                  onPress={() => setActiveModal('paymentType')}
                />
              </>
            )}

            {mode === 'ownTransfers' && (
              <>
                <FilterSelectField
                  label={global.t?.t('invoice', 'label', 'originWallet') || 'Carteira origem'}
                  value={labelById(walletOptions, sourceWalletId, 'wallet')}
                  onPress={() => setActiveModal('sourceWallet')}
                />

                <FilterSelectField
                  label={global.t?.t('invoice', 'label', 'destinationWallet') || 'Carteira destino'}
                  value={labelById(walletOptions, destinationWalletId, 'wallet')}
                  onPress={() => setActiveModal('destinationWallet')}
                />
              </>
            )}
          </View>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={brandColors.primary} />
          <Text style={styles.loadingText}>Carregando {config.title.toLowerCase()}...</Text>
        </View>
      )}

      <FlatList
        data={filteredInvoices}
        keyExtractor={item => String(item.id)}
        renderItem={renderInvoiceCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nenhum registro encontrado</Text>
              <Text style={styles.emptySubtitle}>Ajuste os filtros para visualizar lancamentos.</Text>
            </View>
          ) : null
        }
      />

      <SelectModal
        visible={activeModal === 'status'}
        title={global.t?.t('invoice', 'label', 'status') || 'Status'}
        options={statusOptions}
        selectedId={selectedStatusId}
        onClose={() => setActiveModal('')}
        onSelect={setSelectedStatusId}
        labelKey="status"
        searchPlaceholder="Buscar status"
      />

      <SelectModal
        visible={activeModal === 'receiver'}
        title={mode === 'payables' ? 'Recebedor' : 'Pagador'}
        options={receiverOptions}
        selectedId={selectedReceiverId}
        onClose={() => setActiveModal('')}
        onSelect={setSelectedReceiverId}
        labelKey="name"
        searchPlaceholder="Buscar pessoa"
      />

      <SelectModal
        visible={activeModal === 'category'}
        title={global.t?.t('invoice', 'label', 'category') || 'Categoria'}
        options={categoryOptions}
        selectedId={selectedCategoryId}
        onClose={() => setActiveModal('')}
        onSelect={setSelectedCategoryId}
        labelKey="name"
        searchPlaceholder="Buscar categoria"
      />

      <SelectModal
        visible={activeModal === 'wallet'}
        title={global.t?.t('invoice', 'label', 'wallet') || 'Carteira'}
        options={walletOptions}
        selectedId={selectedWalletId}
        onClose={() => setActiveModal('')}
        onSelect={setSelectedWalletId}
        labelKey="wallet"
        searchPlaceholder="Buscar carteira"
      />

      <SelectModal
        visible={activeModal === 'paymentType'}
        title={global.t?.t('invoice', 'label', 'payment method') || 'Forma de pagamento'}
        options={paymentTypeOptions}
        selectedId={selectedPaymentTypeId}
        onClose={() => setActiveModal('')}
        onSelect={setSelectedPaymentTypeId}
        labelKey="paymentType"
        searchPlaceholder="Buscar forma de pagamento"
      />

      <SelectModal
        visible={activeModal === 'sourceWallet'}
        title={global.t?.t('invoice', 'label', 'originWallet') || 'Carteira origem'}
        options={walletOptions}
        selectedId={sourceWalletId}
        onClose={() => setActiveModal('')}
        onSelect={setSourceWalletId}
        labelKey="wallet"
        searchPlaceholder="Buscar carteira"
      />

      <SelectModal
        visible={activeModal === 'destinationWallet'}
        title={global.t?.t('invoice', 'label', 'destinationWallet') || 'Carteira destino'}
        options={walletOptions}
        selectedId={destinationWalletId}
        onClose={() => setActiveModal('')}
        onSelect={setDestinationWalletId}
        labelKey="wallet"
        searchPlaceholder="Buscar carteira"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...cardShadow,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterCard: {
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    ...cardShadow,
  },
  filterHeaderButton: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filterCountBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterField: {
    minWidth: 180,
    flexGrow: 1,
    flexBasis: 220,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#fff',
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  filterValueRow: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterValue: {
    flex: 1,
    marginRight: 8,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 28,
    gap: 10,
  },
  invoiceCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    ...cardShadow,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceId: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  invoiceInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  invoiceInfoCell: {
    width: '32%',
    minWidth: 180,
  },
  invoiceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  invoiceValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  amountRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  emptyBox: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    ...cardShadow,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    maxHeight: '86%',
    minHeight: 260,
    padding: 14,
    ...cardShadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  modalSearchRow: {
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 420,
  },
  modalListContent: {
    paddingBottom: 8,
  },
  modalOption: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#EAF7FF',
  },
  modalOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  modalOptionTextActive: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
});

export default FinancialEntriesPage;
