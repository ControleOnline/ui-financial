import React, { useCallback, useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStores } from '@store';
import StateStore from '@controleonline/ui-layout/src/react/components/StateStore';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';

const Receivables = () => {
  const { styles } = css();
  const navigation = useNavigation();
  
//   const invoiceStore = useStores(state => state.invoice);
  const invoiceStore = useStores("invoice");
  const { getters, actions } = invoiceStore;

  // States
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    payer: '',
    category: '',
    status: '',
    paymentType: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  // Carrega os dados quando o componente ganha foco
  useFocusEffect(
    useCallback(() => {
      loadReceivables();
    }, []),
  );

  // Carrega as receitas financeiras
  const loadReceivables = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = buildFilterParams();
      await actions.getItems(params);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar as receitas financeiras');
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, [filters, searchText]);

  // Constrói os parâmetros de filtro para a API
  const buildFilterParams = useCallback(() => {
    const params = {};

    if (searchText.trim()) {
      params.id = searchText.trim();
    }

    if (filters.payer) {
      params.payer = filters.payer;
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.paymentType) {
      params.paymentType = filters.paymentType;
    }

    return params;
  }, [filters, searchText]);

  // Reseta os filtros
  const handleResetFilters = useCallback(() => {
    setFilters({
      payer: '',
      category: '',
      status: '',
      paymentType: '',
    });
    setSearchText('');
    loadReceivables();
  }, []);

  // Navega para editar uma receita
  const handleEditReceivable = useCallback((item) => {
    navigation.navigate('ReceivableDetail', { id: item.id });
  }, [navigation]);

  // Deleta uma receita
  const handleDeleteReceivable = useCallback((item) => {
    Alert.alert(
      'Deletar',
      `Deseja deletar a receita #${item.id}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.remove(item.id);
              Alert.alert('Sucesso', 'Receita deletada com sucesso');
              loadReceivables();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao deletar a receita');
              console.error(error);
            }
          },
        },
      ],
    );
  }, []);

  // Renderiza cada item da lista
  const renderReceivableItem = useCallback(({ item }) => {
    const statusColor = item.status?.color || '#666';
    const categoryColor = item.category?.color || '#666';

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: 14, fontWeight: 'bold' }]}>
              #{item.id}
            </Text>
            <Text style={[styles.text, { marginTop: 4, color: categoryColor }]}>
              {item.category?.name || '-'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleEditReceivable(item)}>
            <Icon name="edit" size={20} color="#FFC107" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 8 }]}>
          {item.payer?.name || '---------------'}
        </Text>
        <Text style={[styles.text, { color: statusColor, marginTop: 4 }]}>
          {item.status?.status || '-'}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Vencimento</Text>
            <Text style={styles.text}>
              {Formatter.formatDateYmdTodmY(item.dueDate)}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Carteira</Text>
            <Text style={styles.text} numberOfLines={1}>
              {item.destinationWallet?.wallet || '-'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Pagamento</Text>
            <Text style={styles.text} numberOfLines={1}>
              {item.paymentType?.paymentType || '-'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Parc.</Text>
            <Text style={styles.text}>
              {item.installments === 0
                ? 'Rec.'
                : `${item.portion || 1}X/${item.installments}`}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' }}>
          <Text style={[styles.label, { fontSize: 16, fontWeight: 'bold' }]}>
            {Formatter.formatMoney(item.price)}
          </Text>
        </View>

        <TouchableOpacity
          style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' }}
          onPress={() => handleDeleteReceivable(item)}>
          <Text style={{ color: '#f44336', fontSize: 12 }}>Deletar</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.label, { fontSize: 18, fontWeight: 'bold', marginLeft: 12, flex: 1 }]}>
          Receitas Financeiras
        </Text>
      </View>

      {/* Busca */}
      <View style={{ padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <TextInput
          style={[styles.input, { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginBottom: 8 }]}
          placeholder="Buscar por ID"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onEndEditing={loadReceivables}
        />
        <Text style={[styles.label, { fontSize: 12, marginTop: 8, color: '#666' }]}>
          Pagador
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Categoria
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Status
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Vencimento
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Carteira
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Pagamento
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Parc.
        </Text>
        <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: '#666' }]}>
          Preço
        </Text>
      </View>

      {/* Lista */}
      {getters.isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : (
        <FlatList
          data={getters.items || []}
          renderItem={renderReceivableItem}
          keyExtractor={(item) => `${item.id}`}
          scrollEnabled={true}
          refreshing={refreshing}
          onRefresh={loadReceivables}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View style={{ padding: 32, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.text, { color: '#999' }]}>
                Nenhuma receita financeira encontrada
              </Text>
            </View>
          }
        />
      )}

      {/* Botão Flutuante para Adicionar */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FFC107',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        onPress={() => navigation.navigate('ReceivableDetail')}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Receivables;