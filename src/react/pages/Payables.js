import React, { useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '@store';
import css from '@controleonline/ui-orders/src/react/css/orders';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import ReceiverList from '@controleonline/ui-common/src/react/components/lists/ReceiverList';
import CategoriesList from '@controleonline/ui-common/src/react/components/lists/CategoriesList';
import StatusList from '@controleonline/ui-common/src/react/components/lists/StatusList';
import WalletList from '@controleonline/ui-common/src/react/components/lists/WalletList';
import PaymentTypeList from '@controleonline/ui-common/src/react/components/lists/PaymentTypeList';
import IdInput from '@controleonline/ui-common/src/react/components/inputs/IdInput';
import DateInput from '@controleonline/ui-common/src/react/components/inputs/DateInput';

function Payables() {

  const getEntityId = entity => {
    if (!entity) return null;
    if (typeof entity === 'number' || typeof entity === 'string') {
      const value = String(entity);
      const match = value.match(/\d+/g);
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

  const invoiceStore = useStore("invoice");
  const peopleStore = useStore('people');
  const statusStore = useStore('status');
  const categoriesStore = useStore('categories');
  const walletStore = useStore('wallet');
  const paymentTypeStore = useStore('paymentType');

  const { getters: peopleGetters } = peopleStore;
  const { getters: categoriesGetters } = categoriesStore;
  const { getters: statusGetters } = statusStore;
  const { getters: walletGetters } = walletStore;
  const { getters: paymentTypeGetters } = paymentTypeStore;
  const { getters: invoiceGetters, actions: invoiceActions } = invoiceStore;

  const { items: invoices } = invoiceGetters;
  const { item: status } = statusGetters;
  const { item: categories } = categoriesGetters;
  const { item: wallet } = walletGetters;
  const { item: paymentType } = paymentTypeGetters;
  const filterId = invoiceGetters?.filters?.id || null;
  const filterDueDate = invoiceGetters?.filters?.dueDate || null;
  const { reload } = invoiceGetters;

  const { currentCompany } = peopleGetters;

  const filteredInvoices = (invoices || []).filter(invoice => {
    const payerId = getEntityId(invoice?.payer);
    const receiverId = getEntityId(invoice?.receiver);
    return !(payerId && receiverId && payerId === receiverId);
  });

  const fetchInvoices = function () {
    invoiceActions.getItems({
      payer: currentCompany?.id,
      excludeOwnTransfers: 1,
      status: status?.id,
      categories: categories?.id,
      wallet: wallet?.id,
      paymentType: paymentType?.id,
      id: filterId,
      dueDate: filterDueDate,
    });
  }

  useFocusEffect(
    useCallback(() => {
      if (currentCompany)
        fetchInvoices();
    }, [currentCompany, status, categories, wallet, paymentType, filterId, filterDueDate, reload]),
  );

  const renderHeader = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#FFC700',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: '#FFC700',
    }}>
      <Text style={{ flex: 0.8, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "id")}
      </Text>
      <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "originWallet")}
      </Text>
      <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "receiver")}
      </Text>
      <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "category")}
      </Text>
      <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "dueDate")}
      </Text>
      <Text style={{ flex: 1.1, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "paymentType")}
      </Text>
      <Text style={{ flex: 0.7, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "installments")}
      </Text>
      <Text style={{ flex: 0.8, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "value")}
      </Text>
      <Text style={{ flex: 0.9, fontWeight: 'bold', fontSize: 12 }}>
        {global.t?.t("invoice", "label", "status")}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const backgroundColor = index % 2 === 0 ? '#fff' : '#f5f5f5';
    const statusColor = item?.status?.color || '#ccc';

    return (
      <View style={{
        flexDirection: 'row',
        backgroundColor: backgroundColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center',
      }}>
        <Text style={{ flex: 0.8, fontWeight: 'bold', fontSize: 12, color: '#000' }}>
          #{item.id}
        </Text>
        <Text style={{ flex: 1.2, fontSize: 12, color: '#666' }}>
          {item?.originWallet?.wallet || '-'}
        </Text>
        <Text style={{ flex: 1.2, fontSize: 12, color: '#666' }}>
          {item?.destinationWallet?.wallet || '-'}
        </Text>
        <Text style={{ flex: 1, fontSize: 12, color: '#666' }}>
          {item?.categories?.category || '-'}
        </Text>
        <Text style={{ flex: 1.2, fontSize: 12, color: '#666' }}>
          {Formatter.formatDateYmdTodmY(item?.dueDate)}
        </Text>
        <Text style={{ flex: 1.1, fontSize: 12, color: '#666' }}>
          {item?.paymentType?.paymentType || '-'}
        </Text>
        <Text style={{ flex: 0.7, fontSize: 12, color: '#666' }}>
          {item?.installments || '-'}
        </Text>
        <Text style={{ flex: 0.8, fontSize: 12, fontWeight: '600', color: '#000' }}>
          {Formatter.formatMoney(item?.price)}
        </Text>
        <View style={{ flex: 0.9, justifyContent: 'center' }}>
          <View style={{
            backgroundColor: statusColor,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            alignSelf: 'flex-start',
          }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {global.t?.t("invoice", "label", item?.status?.status)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <IdInput />
        <WalletList people_id={currentCompany?.id} />
        <ReceiverList context={'payer'} />
        <CategoriesList context={'payer'} />
        <DateInput />
        <PaymentTypeList context={'invoice'} />
        <StatusList context={'invoice'} />
      </View>

      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

export default Payables;