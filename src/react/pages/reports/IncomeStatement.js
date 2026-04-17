import React, {useCallback, useMemo, useState} from 'react';
import { Text, View, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {colors} from '@controleonline/../../src/styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './IncomeStatement.styles';

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
  const invoiceStore = useStore('invoice');
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters || {};
  const getIncomeStatements = invoiceStore?.actions?.getIncomeStatements;

  const [period, setPeriod] = useState(7);
  const [exerciseYear, setExerciseYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [incomeRows, setIncomeRows] = useState([]);

  const isCurrentExerciseYear = exerciseYear === CURRENT_YEAR;

  const formatMoney = value => {
    return parseFloat(value || 0).toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
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

  const normalizeIncomeMap = incomeMap => {
    if (!incomeMap || typeof incomeMap !== 'object' || Array.isArray(incomeMap)) {
      return {};
    }

    return incomeMap;
  };

  const toRows = useCallback(incomeMap => {
    const normalized = normalizeIncomeMap(incomeMap);

    return Object.keys(normalized)
      .map(key => Number(key))
      .filter(month => month >= 1 && month <= 12)
      .map(month => {
        const monthData = normalized?.[month] || normalized?.[String(month)] || {};
        const income = Number(monthData?.receive?.total_month_price || 0);
        const expense = Number(monthData?.pay?.total_month_price || 0);

        return {
          month,
          income,
          expense,
          balance: income - expense,
        };
      })
      .sort((a, b) => b.month - a.month);
  }, []);

  const applyPeriodFilter = useCallback(
    rows => {
      if (!Array.isArray(rows) || rows.length === 0) {
        return [];
      }

      if (!isCurrentExerciseYear) {
        return rows.filter(row => row.month === selectedMonth);
      }

      const {start, end} = calculateDateRange({
        days: period,
        year: exerciseYear,
        month: selectedMonth,
      });

      return rows.filter(row => {
        const monthStart = new Date(exerciseYear, row.month - 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(exerciseYear, row.month, 0, 23, 59, 59, 999);
        return monthEnd >= start && monthStart <= end;
      });
    },
    [exerciseYear, isCurrentExerciseYear, period, selectedMonth],
  );

  const loadTransactions = useCallback(async () => {
    if (!currentCompany?.id) {
      return;
    }

    if (typeof getIncomeStatements !== 'function') {
      setError('Acao getIncomeStatements indisponivel.');
      setIncomeRows([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = {
        people: currentCompany.id,
        year: exerciseYear,
      };

      if (!isCurrentExerciseYear) {
        params.month = selectedMonth;
      }

      const response = await getIncomeStatements(params);
      const rows = toRows(response);
      const filteredRows = applyPeriodFilter(rows);
      setIncomeRows(filteredRows);
    } catch (e) {
      console.error('Erro ao carregar income statements:', e);
      setError('Nao foi possivel carregar os dados de comissoes.');
      setIncomeRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    applyPeriodFilter,
    currentCompany?.id,
    exerciseYear,
    getIncomeStatements,
    isCurrentExerciseYear,
    selectedMonth,
    toRows,
  ]);

  const changeExerciseYear = direction => {
    setExerciseYear(prev => {
      const next = prev + direction;
      return Math.max(2000, Math.min(CURRENT_YEAR, next));
    });
  };

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
    return incomeRows.reduce(
      (acc, row) => {
        acc.income += Number(row?.income || 0);
        acc.expense += Number(row?.expense || 0);
        return acc;
      },
      {income: 0, expense: 0},
    );
  }, [incomeRows]);

  const computedSummary = {
    ...summary,
    balance: summary.income - summary.expense,
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
    const amountColor = item?.balance >= 0 ? '#4CAF50' : '#F44336';
    const monthLabel = MONTHS.find(month => month.id === item?.month)?.label || '--';

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardIconContainer}>
          <View style={[styles.iconCircle, {backgroundColor: '#DCFCE7'}]}>
            <Icon name="line-chart" size={16} color={amountColor} />
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {`Comissao ${monthLabel}/${exerciseYear}`}
          </Text>
          <Text style={styles.cardSubtitle}>
            Receitas {formatMoney(item?.income)} - Despesas {formatMoney(item?.expense)}
          </Text>
        </View>

        <View style={styles.cardAmount}>
          <Text style={[styles.amountText, {color: amountColor}]}>
            {formatMoney(item?.balance)}
          </Text>
          <Text style={styles.statusText}>{item?.balance >= 0 ? 'Positivo' : 'Negativo'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 16) + 16}]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Comissoes</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Comissoes</Text>
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
            <Text style={styles.yearTitle}>Exercicio</Text>
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
              <Text style={styles.monthSectionLabel}>Mes</Text>
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
          <Text style={styles.loadingText}>Carregando comissoes...</Text>
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
          data={incomeRows}
          keyExtractor={item => String(item?.month)}
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
                  ? 'Nenhuma comissao no periodo'
                  : `Nenhuma comissao em ${selectedMonthLabel}/${exerciseYear}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default FinancePage;
