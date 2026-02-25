import React, {useCallback, useEffect, useState} from 'react';
import {Text, View, FlatList} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {useStore} from '@store';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import StatusList from '@controleonline/ui-common/src/react/components/lists/StatusList';
import IdInput from '@controleonline/ui-common/src/react/components/inputs/IdInput';
import DateInput from '@controleonline/ui-common/src/react/components/inputs/DateInput2';

function OwnTransfers() {
	const invoiceStore = useStore('invoice');
	const peopleStore = useStore('people');
	const statusStore = useStore('status');
	const walletStore = useStore('wallet');

	const {getters: peopleGetters} = peopleStore;
	const {getters: statusGetters} = statusStore;
	const {getters: walletGetters, actions: walletActions} = walletStore;
	const {getters: invoiceGetters, actions: invoiceActions} = invoiceStore;

	const {items: invoices, reload} = invoiceGetters;
	const filterId = invoiceGetters?.filters?.id || null;
	const filterDueDate = invoiceGetters?.filters?.dueDate || null;
	const {item: status} = statusGetters;
	const {items: wallets} = walletGetters;
	const {currentCompany} = peopleGetters;
    const [sourceWalletId, setSourceWalletId] = useState(null);
    const [destinationWalletId, setDestinationWalletId] = useState(null);

	useEffect(() => {
		if (currentCompany?.id) {
			walletActions.getItems({people: currentCompany.id});
		}
	}, [currentCompany?.id]);

	const fetchInvoices = function () {
		const params = {
			payer: currentCompany?.id,
			receiver: currentCompany?.id,
			ownTransfers: 1,
			status: status?.id,
			sourceWallet: sourceWalletId,
			destinationWallet: destinationWalletId,
			id: filterId,
		};

		if (filterDueDate?.start) params['dueDate[after]'] = filterDueDate.start;
		if (filterDueDate?.end) params['dueDate[before]'] = filterDueDate.end;

		invoiceActions.getItems(params);
	};

	useFocusEffect(
		useCallback(() => {
			if (currentCompany) fetchInvoices();
		}, [currentCompany, status, sourceWalletId, destinationWalletId, filterId, filterDueDate, reload]),
	);

	const renderHeader = () => (
		<View
			style={{
				flexDirection: 'row',
				backgroundColor: '#FFC700',
				paddingHorizontal: 16,
				paddingVertical: 12,
				borderBottomWidth: 2,
				borderBottomColor: '#FFC700',
			}}>
			<Text style={{flex: 0.8, fontWeight: 'bold', fontSize: 12}}>
				{global.t?.t('ownTransfers', 'label', 'id')}
			</Text>
			<Text style={{flex: 1.5, fontWeight: 'bold', fontSize: 12}}>
				{global.t?.t('ownTransfers', 'label', 'originWallet')}
			</Text>
			<Text style={{flex: 1.5, fontWeight: 'bold', fontSize: 12}}>
				{global.t?.t('ownTransfers', 'label', 'destinationWallet')}
			</Text>
			<Text style={{flex: 1.2, fontWeight: 'bold', fontSize: 12}}>
				{global.t?.t('ownTransfers', 'label', 'dueDate')}
			</Text>
			<Text style={{flex: 0.9, fontWeight: 'bold', fontSize: 12}}>
				{global.t?.t('ownTransfers', 'label', 'value')}
			</Text>
			<Text style={{flex: 0.9, fontWeight: 'bold', fontSize: 12}}>
				{global.t?.t('ownTransfers', 'label', 'status')}
			</Text>
		</View>
	);

	const renderItem = ({item, index}) => {
		const backgroundColor = index % 2 === 0 ? '#fff' : '#f5f5f5';
		const statusColor = item?.status?.color || '#ccc';

		return (
			<View
				style={{
					flexDirection: 'row',
					backgroundColor,
					paddingHorizontal: 16,
					paddingVertical: 12,
					borderBottomWidth: 1,
					borderBottomColor: '#e0e0e0',
					alignItems: 'center',
				}}>
				<Text style={{flex: 0.8, fontWeight: 'bold', fontSize: 12, color: '#000'}}>
					#{item.id}
				</Text>
				<Text style={{flex: 1.5, fontSize: 12, color: '#666'}}>
					{item?.sourceWallet?.wallet || item?.originWallet?.wallet || '-'}
				</Text>
				<Text style={{flex: 1.5, fontSize: 12, color: '#666'}}>
					{item?.destinationWallet?.wallet || '-'}
				</Text>
				<Text style={{flex: 1.2, fontSize: 12, color: '#666'}}>
					{Formatter.formatDateYmdTodmY(item?.dueDate)}
				</Text>
				<Text style={{flex: 0.9, fontSize: 12, fontWeight: '600', color: '#000'}}>
					{Formatter.formatMoney(item?.price)}
				</Text>
				<View style={{flex: 0.9, justifyContent: 'center'}}>
					<View
						style={{
							backgroundColor: statusColor,
							paddingHorizontal: 10,
							paddingVertical: 4,
							borderRadius: 20,
							alignSelf: 'flex-start',
						}}>
						<Text style={{color: '#fff', fontSize: 12}}>
							{global.t?.t('ownTransfers', 'label', item?.status?.status)}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	return (
		<View style={{flex: 1}}>
			<View style={{flexDirection: 'row', marginBottom: 12}}>
				<IdInput />
				<View style={{marginVertical: 10, minWidth: 240, marginRight: 10}}>
					<Text style={{fontSize: 16, marginBottom: 5}}>
						{global.t?.t('ownTransfers', 'label', 'originWallet')}
					</Text>
					<View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 6}}>
						<Picker
							selectedValue={sourceWalletId}
							onValueChange={value => setSourceWalletId(value)}>
							<Picker.Item
								label={global.t?.t('ownTransfers', 'label', 'select')}
								value={null}
							/>
							{(wallets || []).map(wallet => (
								<Picker.Item
									key={wallet.id}
									label={wallet.wallet}
									value={wallet.id}
								/>
							))}
						</Picker>
					</View>
				</View>
				<View style={{marginVertical: 10, minWidth: 240, marginRight: 10}}>
					<Text style={{fontSize: 16, marginBottom: 5}}>
						{global.t?.t('ownTransfers', 'label', 'destinationWallet')}
					</Text>
					<View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 6}}>
						<Picker
							selectedValue={destinationWalletId}
							onValueChange={value => setDestinationWalletId(value)}>
							<Picker.Item
								label={global.t?.t('ownTransfers', 'label', 'select')}
								value={null}
							/>
							{(wallets || []).map(wallet => (
								<Picker.Item
									key={wallet.id}
									label={wallet.wallet}
									value={wallet.id}
								/>
							))}
						</Picker>
					</View>
				</View>
				<DateInput />
				<StatusList context={'invoice'} />
			</View>

			<FlatList
				data={invoices}
				keyExtractor={item => String(item.id)}
				renderItem={renderItem}
				ListHeaderComponent={renderHeader}
				scrollEnabled={true}
				contentContainerStyle={{paddingBottom: 40}}
			/>
		</View>
	);
}

export default OwnTransfers;