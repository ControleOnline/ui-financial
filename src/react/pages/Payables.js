import React, { useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import CategoriesList from '@controleonline/ui-common/src/react/components/lists/CategoriesList';
import StatusList from '@controleonline/ui-common/src/react/components/lists/StatusList';
import WalletList from '@controleonline/ui-common/src/react/components/lists/WalletList';

function Payables() {

  const invoiceStore = useStore("invoice");
  const peopleStore = useStore('people');
  const statusStore = useStore('status');
  const categoriesStore = useStore('categories');
  const walletStore = useStore('wallet');

  const { getters: peopleGetters } = peopleStore;
  const { getters: categoriesGetters } = categoriesStore;
  const { getters: statusGetters } = statusStore;
  const { getters: walletGetters } = walletStore;
  const { getters: invoiceGetters, actions: invoiceActions } = invoiceStore;

  const { items: invoices } = invoiceGetters;
  const { item: status } = statusGetters;
  const { item: categories } = categoriesGetters;
  const { item: wallet } = walletGetters;

  const { currentCompany } = peopleGetters;

  const fetchInvoices = function () {
    invoiceActions.getItems({
      payer: currentCompany?.id,
      status: status?.id
    });
  }

  useFocusEffect(
    useCallback(() => {
      if (currentCompany)
        fetchInvoices();
    }, [currentCompany]),
  );

  useFocusEffect(
    useCallback(() => {
        fetchInvoices();
    }, [status]),
  );

  useFocusEffect(
    useCallback(() => {
        fetchInvoices();
    }, [categories]),
  );

  useFocusEffect(
    useCallback(() => {
        fetchInvoices();
    }, [wallet]),
  );

  const renderItem = ({ item }) => {

    const statusColor = item?.status?.color || '#ccc';

    return (
      <View style={{
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        padding: 16,
        elevation: 3,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            #{item.id}
          </Text>

          <View style={{
            backgroundColor: statusColor,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {item?.status?.status}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text>
            Valor: {Formatter.formatMoney(item?.price)}
          </Text>
          <Text>
            Vencimento: {Formatter.formatDateYmdTodmY(item?.dueDate)}
          </Text>
          <Text>
            Carteira destino: {item?.destinationWallet?.wallet}
          </Text>
          <Text>
            Forma de pagamento: {item?.paymentType?.paymentType}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1}}>
      <View style={{ flexDirection: 'row' }}>
        <StatusList context={'invoice'} />
        <CategoriesList company_id={currentCompany?.id} context={'payer'} />
        <WalletList people_id={currentCompany?.id} />
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

export default Payables;
