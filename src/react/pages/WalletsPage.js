import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import { getWalletPaymentTypePreview } from './walletsPagePreview';
import { ps, s, inlineStyle_330_28, inlineStyle_338_30, inlineStyle_400_39 } from './WalletsPage.styles';
import {
  SelectModal,
  FormModal,
  FormField,
  ChipSelect,
} from './WalletsPageModals';

const FREQUENCY_OPTIONS = [
  { value: 'single', label: 'Única' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

const INSTALLMENT_OPTIONS = [
  { value: 'single', label: 'Única' },
  { value: 'split', label: 'Parcelado' },
];

export default function WalletsPage() {
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const walletStore = useStore('wallet');
  const walletPtStore = useStore('walletPaymentType');
  const paymentTypeStore = useStore('paymentType');

  const { currentCompany } = peopleStore.getters || {};
  const { colors: themeColors } = themeStore.getters || {};
  const { isSaving } = walletStore.getters || {};
  const walletPts = walletPtStore.getters?.items;
  const paymentTypes = paymentTypeStore.getters?.items;

  const palette = useMemo(
    () =>
      resolveThemePalette(
        { ...themeColors, ...(currentCompany?.theme?.colors || {}) },
        colors,
      ),
    [themeColors, currentCompany?.id],
  );

  const [walletModal, setWalletModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [walletName, setWalletName] = useState('');
  const [ptModal, setPtModal] = useState(false);
  const [ptModalWallet, setPtModalWallet] = useState(null);
  const [newPtId, setNewPtId] = useState('');
  const [newPtModal, setNewPtModal] = useState(false);
  const [paymentTypeModal, setPaymentTypeModal] = useState(false);
  const [paymentTypeName, setPaymentTypeName] = useState('');
  const [paymentTypeFrequency, setPaymentTypeFrequency] = useState('single');
  const [paymentTypeInstallments, setPaymentTypeInstallments] = useState('single');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const requestParams = useMemo(
    () => (currentCompany?.id ? { people: currentCompany.id } : {}),
    [currentCompany?.id],
  );

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id) return;
      walletStore.actions.getItems({ people: currentCompany.id });
      paymentTypeStore.actions.getItems({ people: currentCompany.id });
    }, [currentCompany?.id]),
  );

  const openNewWallet = () => {
    setEditingWallet(null);
    setWalletName('');
    setWalletModal(true);
  };

  const openEditWallet = w => {
    setEditingWallet(w);
    setWalletName(w?.wallet || '');
    setWalletModal(true);
  };

  const saveWallet = async () => {
    if (!walletName.trim()) return;
    if (editingWallet) {
      await walletStore.actions.save({ id: editingWallet.id, wallet: walletName.trim() });
    } else {
      await walletStore.actions.save({
        people: `/people/${currentCompany.id}`,
        wallet: walletName.trim(),
      });
    }
    setWalletModal(false);
    walletStore.actions.getItems({ people: currentCompany.id });
  };

  const deleteWallet = async id => {
    await walletStore.actions.remove(id);
    walletStore.actions.getItems({ people: currentCompany.id });
    setDeleteConfirm(null);
  };

  const openNewPaymentType = () => {
    setPaymentTypeName('');
    setPaymentTypeFrequency('single');
    setPaymentTypeInstallments('single');
    setPaymentTypeModal(true);
  };

  const savePaymentType = async () => {
    if (!paymentTypeName.trim() || !currentCompany?.id) return;
    await paymentTypeStore.actions.save({
      people: `/people/${currentCompany.id}`,
      paymentType: paymentTypeName.trim(),
      frequency: paymentTypeFrequency,
      installments: paymentTypeInstallments,
    });
    setPaymentTypeModal(false);
    paymentTypeStore.actions.getItems({ people: currentCompany.id });
  };

  const openPtModal = wallet => {
    setPtModalWallet(wallet);
    setNewPtId('');
    walletPtStore.actions.getItems({ wallet: wallet.id });
    setPtModal(true);
  };

  const addPaymentType = async () => {
    if (!newPtId || !ptModalWallet) return;
    await walletPtStore.actions.save({
      wallet: `/wallets/${ptModalWallet.id}`,
      paymentType: `/payment_types/${newPtId}`,
    });
    walletPtStore.actions.getItems({ wallet: ptModalWallet.id });
    setNewPtId('');
    setNewPtModal(false);
  };

  const removePaymentType = async wptId => {
    await walletPtStore.actions.remove(wptId);
    walletPtStore.actions.getItems({ wallet: ptModalWallet?.id });
  };

  const linkedPts = useMemo(() => walletPts || [], [walletPts]);
  const availablePts = useMemo(() => {
    const linkedIds = linkedPts.map(wpt => {
      const ptId =
        typeof wpt.paymentType === 'object' ? wpt.paymentType?.id : wpt.paymentType;
      return String(ptId || '');
    });
    return (paymentTypes || []).filter(pt => !linkedIds.includes(String(pt.id)));
  }, [paymentTypes, linkedPts]);

  const freqLabel = v => FREQUENCY_OPTIONS.find(o => o.value === v)?.label || v || '-';
  const instLabel = v => INSTALLMENT_OPTIONS.find(o => o.value === v)?.label || v || '-';

  const renderWalletCard = useCallback(
    ({ item: w }) => {
      if (!w) return null;
      const preview = getWalletPaymentTypePreview(w.walletPaymentTypes || []);
      return (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={ps.cardTitle}>{w.wallet}</Text>
              {w.balance !== undefined && (
                <Text style={[ps.cardBalance, { color: palette.primary }]}>
                  Saldo: {Formatter.formatMoney(w.balance || 0)}
                </Text>
              )}
            </View>
          </View>
          {preview.length > 0 ? (
            <View style={ps.chipRow}>
              {preview.map(wpt => {
                const pt = typeof wpt.paymentType === 'object' ? wpt.paymentType : null;
                if (!pt) return null;
                return (
                  <View
                    key={wpt.id}
                    style={[ps.chip, { backgroundColor: withOpacity(palette.primary, 0.1) }]}>
                    <Text style={[ps.chipText, { color: palette.primary }]}>{pt.paymentType}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      );
    },
    [palette.primary],
  );

  const rowActionsComponent = useCallback(
    ({ row }) => (
      <View style={ps.cardActions}>
        <TouchableOpacity
          style={[
            ps.iconBtn,
            {
              backgroundColor: themeColors.buttonBackground,
              borderColor: themeColors.buttonBackground,
            },
          ]}
          onPress={() => openPtModal(row)}>
          <Icon name="link" size={16} color={themeColors.buttonIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            ps.iconBtn,
            {
              backgroundColor: themeColors.buttonBackground,
              borderColor: themeColors.buttonBackground,
            },
          ]}
          onPress={() => openEditWallet(row)}>
          <Icon name="edit-2" size={16} color={themeColors.buttonIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            ps.iconBtn,
            {
              backgroundColor: themeColors.buttonBackground,
              borderColor: themeColors.buttonBackground,
            },
          ]}
          onPress={() =>
            setDeleteConfirm({ type: 'wallet', id: row.id, label: row.wallet })
          }>
          <Icon name="trash-2" size={16} color={themeColors.buttonIcon} />
        </TouchableOpacity>
      </View>
    ),
    [themeColors.buttonBackground, themeColors.buttonIcon],
  );

  return (
    <SafeAreaView style={[ps.root, { backgroundColor: palette.background }]}>
      <View style={[ps.header, { backgroundColor: '#fff', borderBottomColor: '#E2E8F0' }]}>
        <Text style={ps.headerTitle}>Carteiras</Text>
        <View style={ps.headerActions}>
          <TouchableOpacity
            style={[ps.addBtn, { backgroundColor: themeColors.buttonBackground }]}
            onPress={openNewWallet}>
            <Icon name="plus" size={16} color={themeColors.buttonIcon} />
            <Text style={[ps.addBtnText, { color: themeColors.buttonText }]}>Nova carteira</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 8 }}>
        <DefaultTable
          storeName="wallet"
          requestParams={requestParams}
          initialViewMode="cards"
          forceCardsOnCompact
          add
          onAdd={openNewWallet}
          onEditRow={openEditWallet}
          onRowPress={openEditWallet}
          showRowActions
          pinRowActions
          rowActionsComponent={rowActionsComponent}
          renderCard={renderWalletCard}
          searchProps={{
            compact: true,
            placeholder: 'Buscar carteira',
            searchKey: 'search',
            storeName: 'wallet',
          }}
          totalItemsLabel="wallets"
          visibleColumnsPreferenceKey="wallet"
          accentColor={palette.primary}
          toolbarActions={[
            {
              key: 'new-payment-type',
              label: 'Nova forma',
              icon: 'credit-card',
              onPress: openNewPaymentType,
            },
          ]}
        />
      </View>

      <FormModal
        visible={walletModal}
        title={editingWallet ? 'Editar carteira' : 'Nova carteira'}
        onClose={() => setWalletModal(false)}
        onSave={saveWallet}
        isSaving={isSaving}>
        <FormField label="Nome da carteira *">
          <TextInput
            style={s.textInput}
            value={walletName}
            onChangeText={setWalletName}
            placeholder="Ex: Caixa, Banco, Pix..."
            placeholderTextColor="#94A3B8"
            autoFocus
          />
        </FormField>
      </FormModal>

      <Modal
        transparent
        visible={ptModal}
        animationType="fade"
        onRequestClose={() => setPtModal(false)}>
        <TouchableWithoutFeedback onPress={() => setPtModal(false)}>
          <View style={s.backdrop}>
            <TouchableWithoutFeedback>
              <View style={s.sheet}>
                <View style={s.sheetHeader}>
                  <Text style={s.sheetTitle} numberOfLines={1}>
                    Formas · {ptModalWallet?.wallet}
                  </Text>
                  <TouchableOpacity onPress={() => setPtModal(false)} style={s.closeBtn}>
                    <Icon name="x" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={inlineStyle_330_28}>
                  {linkedPts.length === 0 && (
                    <Text style={s.emptyMsg}>Nenhuma forma vinculada.</Text>
                  )}
                  {linkedPts.map(wpt => {
                    const pt =
                      typeof wpt.paymentType === 'object'
                        ? wpt.paymentType
                        : { paymentType: '—' };
                    return (
                      <View key={wpt.id} style={s.wptRow}>
                        <View style={inlineStyle_338_30}>
                          <Text style={s.wptName}>{pt.paymentType}</Text>
                          <Text style={s.wptMeta}>
                            {freqLabel(pt.frequency)} · {instLabel(pt.installments)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removePaymentType(wpt.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Icon name="trash-2" size={15} color="#c10015" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
                <View style={s.formActions}>
                  <TouchableOpacity
                    style={[s.btnSave, { flex: 1 }]}
                    onPress={() => setNewPtModal(true)}>
                    <Text style={s.btnSaveText}>Vincular forma</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <SelectModal
        visible={newPtModal}
        title="Selecionar forma de pagamento"
        options={(availablePts || []).map(pt => ({
          value: pt.id,
          label: pt.paymentType,
        }))}
        selectedValue={newPtId}
        onClose={() => setNewPtModal(false)}
        onSelect={async val => {
          if (!val || !ptModalWallet) return;
          setNewPtId(val);
          await walletPtStore.actions.save({
            wallet: `/wallets/${ptModalWallet.id}`,
            paymentType: `/payment_types/${val}`,
          });
          walletPtStore.actions.getItems({ wallet: ptModalWallet.id });
          setNewPtId('');
          setNewPtModal(false);
        }}
        searchPlaceholder="Buscar forma..."
      />

      <FormModal
        visible={paymentTypeModal}
        title="Nova forma de pagamento"
        onClose={() => setPaymentTypeModal(false)}
        onSave={savePaymentType}
        isSaving={paymentTypeStore.getters?.isSaving}>
        <FormField label="Nome *">
          <TextInput
            style={s.textInput}
            value={paymentTypeName}
            onChangeText={setPaymentTypeName}
            placeholder="Ex: Dinheiro, Cartao, Pix..."
            placeholderTextColor="#94A3B8"
            autoFocus
          />
        </FormField>
        <FormField label="Frequencia *">
          <ChipSelect
            options={FREQUENCY_OPTIONS}
            value={paymentTypeFrequency}
            onChange={setPaymentTypeFrequency}
            palette={palette}
          />
        </FormField>
        <FormField label="Parcelamento *">
          <ChipSelect
            options={INSTALLMENT_OPTIONS}
            value={paymentTypeInstallments}
            onChange={setPaymentTypeInstallments}
            palette={palette}
          />
        </FormField>
      </FormModal>

      <Modal
        transparent
        visible={!!deleteConfirm}
        animationType="fade"
        onRequestClose={() => setDeleteConfirm(null)}>
        <TouchableWithoutFeedback onPress={() => setDeleteConfirm(null)}>
          <View style={s.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[s.sheet, { minHeight: 'auto', paddingBottom: 20 }]}>
                <Text style={[s.sheetTitle, { marginBottom: 8 }]}>Confirmar exclusão</Text>
                <Text style={s.deleteMsg}>
                  Deseja excluir <Text style={inlineStyle_400_39}>{deleteConfirm?.label}</Text>?
                </Text>
                <View style={s.formActions}>
                  <TouchableOpacity style={s.btnCancel} onPress={() => setDeleteConfirm(null)}>
                    <Text style={s.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.btnSave, { backgroundColor: '#c10015' }]}
                    onPress={() => deleteWallet(deleteConfirm?.id)}>
                    <Text style={s.btnSaveText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

