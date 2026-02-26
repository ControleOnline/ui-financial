import React, {useCallback, useMemo, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {colors} from '@controleonline/../../src/styles/colors';
import {api} from '@controleonline/ui-common/src/api';
import Icon from 'react-native-vector-icons/FontAwesome';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const MONTHS = [
  {id: 1, label: 'Jan'},
  {id: 2, label: 'Fev'},
  {id: 3, label: 'Mar'},
  {id: 4, label: 'Abr'},
  {id: 5, label: 'Mai'},
  {id: 6, label: 'Jun'},
  {id: 7, label: 'Jul'},
  {id: 8, label: 'Ago'},
  {id: 9, label: 'Set'},
  {id: 10, label: 'Out'},
  {id: 11, label: 'Nov'},
  {id: 12, label: 'Dez'},
];

const FinancePage = () => {
  const insets = useSafeAreaInsets();
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters;
  const authStore = useStore('auth');
  const {user: authUser} = authStore.getters || {};

  const [period, setPeriod] = useState(7);
  const [exerciseYear, setExerciseYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);

  const isCurrentExerciseYear = exerciseYear === CURRENT_YEAR;

  const formatDate = date => {
    if (!date) {
      return '--/--';
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return '--/--';
    }

    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatMoney = value => {
    return parseFloat(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDateForApi = date => {
    if (!date || Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const calculateDateRange = ({days, year, month}) => {
    if (year !== CURRENT_YEAR) {
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      return {start, end};
    }

    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - days + 1);

    return {start, end};
  };

  const changeExerciseYear = direction => {
    setExerciseYear(prev => {
      const next = prev + direction;
      return Math.max(2000, Math.min(CURRENT_YEAR, next));
    });
  };

  const getInvoiceDate = invoice => {
    const rawDate = invoice?.dueDate || invoice?.createdAt || invoice?.updatedAt;
    if (!rawDate) {
      return null;
    }

    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const getLoggedPersonId = () => {
    const candidates = [
      authUser?.id,
      authUser?.people?.id,
      authUser?.person?.id,
      authUser?.profile?.id,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  };

  const isClosedCommissionStatus = status => {
    const statusId = Number(status?.id);
    if (statusId === 6 || statusId === 7) {
      return true;
    }

    const label = String(status?.status || '')
      .trim()
      .toLowerCase();

    if (!label) {
      return false;
    }

    return (
      label.includes('pago') ||
      label.includes('paid') ||
      label.includes('quitado') ||
      label.includes('conclu') ||
      label.includes('finaliz') ||
      label.includes('closed') ||
      label.includes('fechado')
    );
  };

  const loadTransactions = useCallback(async () => {
    if (!currentCompany?.id) {
      return;
    }

    const loggedPersonId = getLoggedPersonId();
    if (!loggedPersonId) {
      setTransactions([]);
      setError('Usuário logado não identificado para filtrar comissões.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const companyRef = `/people/${currentCompany.id}`;
      const userRef = `/people/${loggedPersonId}`;
      const {start, end} = calculateDateRange({
        days: period,
        year: exerciseYear,
        month: selectedMonth,
      });
      const baseParams = {
        page: 1,
        itemsPerPage: 300,
        'order[dueDate]': 'desc',
        payer: companyRef,
        receiver: userRef,
        'dueDate[after]': formatDateForApi(start),
        'dueDate[before]': formatDateForApi(end),
      };

      const response = await api.fetch('invoices', {
        params: baseParams,
      });

      const allTransactions = Array.isArray(response?.member)
        ? response.member
        : [];

      const filteredTransactions = allTransactions.filter(invoice => {
        if (!isClosedCommissionStatus(invoice?.status)) {
          return false;
        }

        const invoiceDate = getInvoiceDate(invoice);

        if (!invoiceDate) {
          return true;
        }

        return invoiceDate >= start && invoiceDate <= end;
      });

      filteredTransactions.sort((a, b) => {
        const dateA = getInvoiceDate(a);
        const dateB = getInvoiceDate(b);

        if (!dateA && !dateB) {
          return 0;
        }

        if (!dateA) {
          return 1;
        }

        if (!dateB) {
          return -1;
        }

        return dateB.getTime() - dateA.getTime();
      });

      setTransactions(filteredTransactions);
    } catch (e) {
      console.error('Erro ao carregar financeiro:', e);
      setError('Nao foi possivel carregar os dados de comissoes.');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, authUser?.id, period, exerciseYear, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, invoice) => {
        const amount = parseFloat(invoice?.price || 0) || 0;
        acc.income += amount;
        return acc;
      },
      {income: 0},
    );
  }, [transactions]);

  const computedSummary = {
    ...summary,
    balance: summary.income,
  };
  const selectedMonthLabel =
    MONTHS.find(month => month.id === selectedMonth)?.label || '';

  const renderFilterButton = days => (
    <TouchableOpacity
      style={[styles.filterButton, period === days && styles.filterButtonActive]}
      onPress={() => setPeriod(days)}>
      <Text
        style={[
          styles.filterButtonText,
          period === days && styles.filterButtonTextActive,
        ]}>
        {days} dias
      </Text>
    </TouchableOpacity>
  );

  const renderMonthButton = month => (
    <TouchableOpacity
      key={month.id}
      style={[
        styles.monthButton,
        selectedMonth === month.id && styles.monthButtonActive,
      ]}
      onPress={() => setSelectedMonth(month.id)}>
      <Text
        style={[
          styles.monthButtonText,
          selectedMonth === month.id && styles.monthButtonTextActive,
        ]}>
        {month.label}
      </Text>
    </TouchableOpacity>
  );

  const renderInvoice = ({item}) => {
    const iconName = 'arrow-down';
    const iconColor = '#4CAF50';
    const amountColor = '#4CAF50';

    const counterpart = item?.payer?.name || item?.payer?.alias || 'Origem nao identificada';

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardIconContainer}>
          <View style={[styles.iconCircle, {backgroundColor: '#DCFCE7'}]}>
            <Icon name={iconName} size={16} color={iconColor} />
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {counterpart}
          </Text>
          <Text style={styles.cardSubtitle}>
            {item?.category?.name || 'Sem categoria'} • {formatDate(item?.dueDate || item?.createdAt)}
          </Text>
        </View>

        <View style={styles.cardAmount}>
          <Text style={[styles.amountText, {color: amountColor}]}>
            + {formatMoney(item?.price)}
          </Text>
          <Text style={styles.statusText}>{item?.status?.status || 'Pendente'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 16) + 16}]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Comissões</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Comissões</Text>
            <Text style={[styles.summaryValue, {color: '#4CAF50'}]}>
              {formatMoney(computedSummary.income)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Saldo</Text>
            <Text
              style={[
                styles.summaryValue,
                {color: computedSummary.balance >= 0 ? '#4CAF50' : '#F44336'},
              ]}>
              {formatMoney(computedSummary.balance)}
            </Text>
          </View>
        </View>

        <View style={styles.filtersPanel}>
          <View style={styles.yearSelector}>
            <Text style={styles.yearTitle}>Exercício</Text>
            <View style={styles.yearSelectorControl}>
              <TouchableOpacity
                onPress={() => changeExerciseYear(-1)}
                style={styles.yearArrowButton}>
                <Icon name="chevron-left" size={14} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.yearLabel}>{exerciseYear}</Text>
              <TouchableOpacity
                onPress={() => changeExerciseYear(1)}
                style={styles.yearArrowButton}>
                <Icon name="chevron-right" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {isCurrentExerciseYear ? (
            <View style={styles.filterRow}>
              {renderFilterButton(7)}
              {renderFilterButton(30)}
              {renderFilterButton(60)}
              {renderFilterButton(90)}
            </View>
          ) : (
            <View style={styles.monthSection}>
              <Text style={styles.monthSectionLabel}>Mês</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.monthScrollContent}>
                {MONTHS.map(renderMonthButton)}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando comissões...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={46} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTransactions}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => String(item?.id || item?.['@id'])}
          renderItem={renderInvoice}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="exchange" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {isCurrentExerciseYear
                  ? 'Nenhuma comissão no período'
                  : `Nenhuma comissão em ${selectedMonthLabel}/${exerciseYear}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...Platform.select({
      android: {elevation: 4},
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  filtersPanel: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  yearSelector: {
    marginBottom: 8,
  },
  yearTitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  yearSelectorControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  yearArrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  yearLabel: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  monthSection: {
    marginTop: 2,
  },
  monthSectionLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  monthScrollContent: {
    paddingBottom: 2,
  },
  monthButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  monthButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  monthButtonTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 12,
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      android: {elevation: 2},
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  cardIconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  cardAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
  },
});

export default FinancePage;
