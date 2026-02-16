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
import StatusList from '@controleonline/ui-common/src/react/components/lists/StatusList';

function Payables() {

  const invoiceStore = useStore("invoice");
  const peopleStore = useStore('people');
  const statusStore = useStore('status');

  const { getters: peopleGetters } = peopleStore;
  const { getters: statusGetters } = statusStore;
  const { getters: invoiceGetters, actions: invoiceActions } = invoiceStore;

  const { items: invoices } = invoiceGetters;
  const { item: status } = statusGetters;
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
    <View style={{ flex: 1 }}>
      <StatusList context={'invoice'} />

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
