import React, {useState, useCallback, useMemo} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useStore} from '@store';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 6) / 2; // 6 = margens laterais + espaçamento entre cards

// Função auxiliar para obter nome do mês
const getMonthName = index => {
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return monthNames[index - 1] || '';
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  filterContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#495057',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveValue: {
    color: '#28a745',
  },
  negativeValue: {
    color: '#dc3545',
  },
  neutralValue: {
    color: '#495057',
  },
  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    minHeight: 280,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginTop: 15,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    fontWeight: '500',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  detailButton: {
    padding: 6,
    marginLeft: 8,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: width - 40,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  modalItemName: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  modalItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
};

const FinancePage = () => {
  const invoiceStore = useStore('invoice')';
  const invoiceActions = invoiceStore.actions;
  const getters = invoiceStore.getters;
  const peopleStore = useStore('people');
  const peopleGetters = peopleStore.getters;
  const {currentCompany, isLoading} = peopleGetters;
  const {items: data} = getters;

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    people: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Calculações do resumo anual
  const yearSummary = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return {
        totalReceitas: 0,
        totalDespesas: 0,
        saldoTotal: 0,
        melhorMes: '',
        piorMes: '',
      };
    }

    let totalReceitas = 0;
    let totalDespesas = 0;
    let melhorSaldo = -Infinity;
    let piorSaldo = Infinity;
    let melhorMes = '';
    let piorMes = '';

    Object.values(data).forEach((month, index) => {
      const receitas = month.receive?.total_month_price || 0;
      const despesas = month.pay?.total_month_price || 0;
      const saldo = receitas - despesas;

      totalReceitas += receitas;
      totalDespesas += despesas;

      if (saldo > melhorSaldo) {
        melhorSaldo = saldo;
        melhorMes = getMonthName(index + 1);
      }

      if (saldo < piorSaldo) {
        piorSaldo = saldo;
        piorMes = getMonthName(index + 1);
      }
    });

    return {
      totalReceitas,
      totalDespesas,
      saldoTotal: totalReceitas - totalDespesas,
      melhorMes,
      piorMes,
    };
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentCompany]),
  );

  const loadData = async () => {
    try {
      setError(null);
      if (currentCompany) {
        const updatedFilters = {...filters, people: currentCompany.id};
        setFilters(updatedFilters);
        await invoiceActions.getIncomeStatements(updatedFilters);
      }
    } catch (err) {
      setError('Erro ao carregar dados financeiros. Tente novamente.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const clearFilters = () => {
    const newFilters = {
      year: new Date().getFullYear().toString(),
      people: currentCompany?.id,
    };
    setFilters(newFilters);
    invoiceActions.getIncomeStatements(newFilters);
  };

  const validateYear = year => {
    const currentYear = new Date().getFullYear();
    const numYear = parseInt(year);
    return numYear >= 2000 && numYear <= currentYear + 10;
  };

  const handleFilterPress = () => {
    if (!validateYear(filters.year)) {
      Alert.alert(
        'Erro',
        'Por favor, insira um ano válido (2000 - ' +
          (new Date().getFullYear() + 10) +
          ')',
      );
      return;
    }
    loadData();
  };

  const formatMoney = value => {
    const num = parseFloat(value || 0);
    return num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getBalanceColor = month => {
    const balance =
      (month.receive?.total_month_price || 0) -
      (month.pay?.total_month_price || 0);
    if (balance > 0) {
      return styles.positiveValue.color;
    }
    if (balance < 0) {
      return styles.negativeValue.color;
    }
    return styles.neutralValue.color;
  };

  const showDetails = (parentCategories, monthName) => {
    setSelectedCategories(parentCategories);
    setSelectedMonth(monthName);
    setModalVisible(true);
  };

  const renderMonthCard = ({item, index}) => {
    const monthName = getMonthName(index + 1);
    const receitas = item.receive?.total_month_price || 0;
    const despesas = item.pay?.total_month_price || 0;
    const saldo = receitas - despesas;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{monthName}</Text>

        {/* Receitas */}
        <Text style={styles.sectionHeader}>Receitas</Text>
        <ScrollView
          style={{maxHeight: 40}}
          showsVerticalScrollIndicator={false}>
          {Object.values(item.receive?.parent_categories || {}).map(
            cat =>
              cat.total_parent_category_price > 0 && (
                <View key={cat.parent_category_name} style={styles.categoryRow}>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {cat.parent_category_name}
                  </Text>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() =>
                      showDetails(item.receive.parent_categories, monthName)
                    }>
                    <Text style={styles.categoryValue}>
                      {formatMoney(cat.total_parent_category_price)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ),
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Receita</Text>
            <Text style={[styles.footerValue, styles.positiveValue]}>
              {formatMoney(receitas)}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Saldo</Text>
            <Text style={[styles.balanceValue, {color: getBalanceColor(item)}]}>
              {formatMoney(saldo)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.emptyStateText}>
            Carregando dados financeiros...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Filtros */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filtros</Text>
          <TextInput
            style={styles.input}
            value={filters.year}
            onChangeText={text =>
              setFilters({...filters, year: text.replace(/\D/g, '')})
            }
            placeholder="Digite o ano (ex: 2024)"
            keyboardType="numeric"
            maxLength={4}
            onSubmitEditing={handleFilterPress}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={clearFilters}>
              <Text style={styles.buttonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleFilterPress}>
              <Text style={styles.buttonText}>Filtrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Resumo Anual */}
        {data && Object.keys(data).length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>
              Resumo do Ano {filters.year}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Receitas</Text>
              <Text style={[styles.summaryValue, styles.positiveValue]}>
                {formatMoney(yearSummary.totalReceitas)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Saldo Total</Text>
              <Text
                style={[
                  styles.summaryValue,
                  yearSummary.saldoTotal >= 0
                    ? styles.positiveValue
                    : styles.negativeValue,
                ]}>
                {formatMoney(yearSummary.saldoTotal)}
              </Text>
            </View>
            {yearSummary.melhorMes && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Melhor Mês</Text>
                <Text style={[styles.summaryValue, styles.neutralValue]}>
                  {yearSummary.melhorMes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Lista de Meses */}
        {data && Object.keys(data).length > 0 ? (
          <View style={styles.listContainer}>
            <FlatList
              data={Object.values(data)}
              renderItem={renderMonthCard}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: CARD_MARGIN,
              }}
            />
          </View>
        ) : (
          !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhum dado financeiro encontrado para o ano {filters.year}.
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalhes - {selectedMonth}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedCategories &&
                Object.values(selectedCategories).map(parent => (
                  <View
                    key={parent.parent_category_name}
                    style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      {parent.parent_category_name}
                    </Text>
                    {parent.categories_childs?.map(child => (
                      <View
                        key={child.category_name}
                        style={styles.modalItemRow}>
                        <Text style={styles.modalItemName}>
                          {child.category_name}
                        </Text>
                        <Text style={styles.modalItemValue}>
                          {formatMoney(child.category_price)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FinancePage;
