import React, {useState, useCallback} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {getStore} from '@store'; // Ajuste conforme seu caminho
import {useNavigation, useFocusEffect} from '@react-navigation/native';

// Estilos (simplificados, você pode ajustar conforme seu CSS original)
const styles = {
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  filterContainer: {padding: 10, backgroundColor: '#fff'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 5,
    elevation: 2,
    minHeight: 300,
  },
  cardTitle: {fontSize: 18, fontWeight: 'bold'},
  sectionHeader: {fontSize: 16, fontWeight: 'bold', marginVertical: 5},
  itemText: {fontSize: 14},
  footerText: {fontSize: 14, marginTop: 5},
  modalContainer: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 5,
  },
  row: {flexDirection: 'row', justifyContent: 'space-between'},
};

const FinancePage = () => {
  const {actions: invoiceActions} = getStore('invoice');
  const {getters: peopleGetters} = getStore('people');
  const {currentCompany, isLoading} = peopleGetters;

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    people: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentCompany]),
  );

  const loadData = () => {
    if (currentCompany) {
      const updatedFilters = {...filters, people: currentCompany.id};
      setFilters(updatedFilters);
      invoiceActions.getIncomeStatements(updatedFilters);
    }
  };

  const clearFilters = () => {
    setFilters({
      year: new Date().getFullYear().toString(),
      people: currentCompany?.id,
    });
    loadData();
  };

  const formatMoney = value => {
    return `R$ ${parseFloat(value || 0)
      .toFixed(2)
      .replace('.', ',')}`;
  };

  const getBalanceColor = month => {
    const balance =
      (month.receive?.total_month_price || 0) -
      (month.pay?.total_month_price || 0);
    return balance < 0 ? '#ff0000' : '#00ff00';
  };

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
    return monthNames[index - 1];
  };

  const showDetails = parentCategories => {
    setSelectedCategories(parentCategories);
    setModalVisible(true);
  };

  const renderMonthCard = ({item, index}) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{getMonthName(index + 1)}</Text>

      {/* Receitas */}
      <Text style={styles.sectionHeader}>Receitas</Text>
      {Object.values(item.receive?.parent_categories || {}).map(
        cat =>
          cat.total_parent_category_price > 0 && (
            <View key={cat.parent_category_name} style={styles.row}>
              <Text style={styles.itemText}>{cat.parent_category_name}</Text>
              <TouchableOpacity
                onPress={() => showDetails(item.receive.parent_categories)}>
                <Text style={styles.itemText}>
                  {formatMoney(cat.total_parent_category_price)}
                </Text>
              </TouchableOpacity>
            </View>
          ),
      )}

      {/* Despesas */}
      <Text style={styles.sectionHeader}>Despesas</Text>
      {Object.values(item.pay?.parent_categories || {}).map(
        cat =>
          cat.total_parent_category_price > 0 && (
            <View key={cat.parent_category_name} style={styles.row}>
              <Text style={styles.itemText}>{cat.parent_category_name}</Text>
              <TouchableOpacity
                onPress={() => showDetails(item.pay.parent_categories)}>
                <Text style={styles.itemText}>
                  {formatMoney(cat.total_parent_category_price)}
                </Text>
              </TouchableOpacity>
            </View>
          ),
      )}

      {/* Footer */}
      <View style={{position: 'absolute', bottom: 10, width: '100%'}}>
        <View style={styles.row}>
          <Text style={styles.footerText}>Total de Receitas</Text>
          <Text style={[styles.footerText, {color: '#00ff00'}]}>
            {formatMoney(item.receive?.total_month_price)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.footerText}>Total de Despesas</Text>
          <Text style={[styles.footerText, {color: '#ff0000'}]}>
            {formatMoney(item.pay?.total_month_price)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.footerText}>Saldo</Text>
          <Text
            style={[
              styles.footerText,
              {color: getBalanceColor(item), fontWeight: 'bold'},
            ]}>
            {formatMoney(
              (item.receive?.total_month_price || 0) -
                (item.pay?.total_month_price || 0),
            )}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          value={filters.year}
          onChangeText={text =>
            setFilters({...filters, year: text.replace(/\D/g, '')})
          }
          placeholder="Ano"
          keyboardType="numeric"
          maxLength={4}
          onSubmitEditing={loadData}
        />
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity style={styles.button} onPress={loadData}>
            <Text style={styles.buttonText}>Filtrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={clearFilters}>
            <Text style={styles.buttonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Meses */}
      {!isLoading && Object.keys(data).length > 0 && (
        <FlatList
          data={Object.values(data)}
          renderItem={renderMonthCard}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={{paddingBottom: 20}}
        />
      )}

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedCategories &&
              Object.values(selectedCategories).map(parent => (
                <View key={parent.parent_category_name}>
                  <Text style={styles.sectionHeader}>
                    {parent.parent_category_name}
                  </Text>
                  {parent.categories_childs?.map(child => (
                    <Text key={child.category_name}>
                      {child.category_name}: {formatMoney(child.category_price)}
                    </Text>
                  ))}
                </View>
              ))}
            <TouchableOpacity
              style={[styles.button, {marginTop: 20}]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FinancePage;
