import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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

/* ─── sombra padrão ─────────────────────────────────────────────────── */
const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

/* ─── frequência label ───────────────────────────────────────────────── */
const FREQUENCY_OPTIONS = [
  { value: 'single',  label: 'Única' },
  { value: 'daily',   label: 'Diário' },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];
const INSTALLMENT_OPTIONS = [
  { value: 'single', label: 'Única' },
  { value: 'split',  label: 'Parcelado' },
];

/* ─── modal de seleção (padrão do sistema) ───────────────────────────── */
const SelectModal = ({ visible, title, options, selectedValue, onClose, onSelect, labelKey = 'label', valueKey = 'value', searchPlaceholder }) => {
  const [search, setSearch] = useState('');
  useEffect(() => { if (!visible) setSearch(''); }, [visible]);

  const filtered = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    if (!term) return options;
    return (options || []).filter(o => String(o[labelKey] || '').toLowerCase().includes(term));
  }, [options, search, labelKey]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop}>
          <TouchableWithoutFeedback>
            <View style={s.sheet}>
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                  <Icon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
              <View style={s.searchRow}>
                <Icon name="search" size={14} color="#94A3B8" />
                <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
                  placeholder={searchPlaceholder || 'Buscar...'} placeholderTextColor="#94A3B8" />
              </View>
              <ScrollView style={s.optionList} contentContainerStyle={{ paddingBottom: 8 }}>
                {filtered.map(item => {
                  const val = item[valueKey];
                  const sel = String(selectedValue || '') === String(val);
                  return (
                    <TouchableOpacity key={String(val)} style={[s.option, sel && s.optionActive]}
                      onPress={() => { onSelect(val); onClose(); }}>
                      {!!item.color && <View style={[s.optionDot, { backgroundColor: item.color }]} />}
                      <Text style={[s.optionText, sel && s.optionTextActive]} numberOfLines={1}>
                        {String(item[labelKey] || '-')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/* ─── modal de formulário ────────────────────────────────────────────── */
const FormModal = ({ visible, title, onClose, onSave, isSaving, children }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={s.backdrop}>
        <TouchableWithoutFeedback>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Icon name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 480 }} keyboardShouldPersistTaps="handled">
              <View style={{ padding: 4 }}>{children}</View>
            </ScrollView>
            <View style={s.formActions}>
              <TouchableOpacity style={s.btnCancel} onPress={onClose}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnSave, isSaving && { opacity: 0.6 }]} onPress={onSave} disabled={isSaving}>
                {isSaving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.btnSaveText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const FormField = ({ label, children }) => (
  <View style={s.formField}>
    <Text style={s.formLabel}>{label}</Text>
    {children}
  </View>
);

/* ─── componente principal ───────────────────────────────────────────── */
export default function WalletsPage() {
  const walletStore        = useStore('wallet');
  const walletPtStore      = useStore('walletPaymentType');
  const paymentTypeStore   = useStore('paymentType');
  const peopleStore        = useStore('people');
  const themeStore         = useStore('theme');

  const { currentCompany } = peopleStore.getters;
  const { items: wallets, isLoading, isSaving } = walletStore.getters;
  const { items: walletPts, isSaving: isSavingWpt } = walletPtStore.getters;
  const { items: paymentTypes } = paymentTypeStore.getters;
  const { colors: themeColors } = themeStore.getters;

  const palette = useMemo(() => resolveThemePalette({ ...themeColors, ...(currentCompany?.theme?.colors || {}) }, colors), [themeColors, currentCompany?.id]);

  /* ── estado do modal de carteira ── */
  const [walletModal, setWalletModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [walletName, setWalletName] = useState('');

  /* ── estado do modal de forma de pagamento (vínculo) ── */
  const [ptModal, setPtModal] = useState(false);
  const [ptModalWallet, setPtModalWallet] = useState(null);
  const [newPtId, setNewPtId] = useState('');
  const [newPtModal, setNewPtModal] = useState(false); // seletor de pt

  /* ── confirmação de exclusão ── */
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, label }

  useFocusEffect(useCallback(() => {
    if (!currentCompany?.id) return;
    walletStore.actions.getItems({ people: currentCompany.id });
    paymentTypeStore.actions.getItems({ people: currentCompany.id });
  }, [currentCompany?.id]));

  const openNewWallet = () => {
    setEditingWallet(null);
    setWalletName('');
    setWalletModal(true);
  };

  const openEditWallet = (w) => {
    setEditingWallet(w);
    setWalletName(w.wallet || '');
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

  const deleteWallet = async (id) => {
    await walletStore.actions.remove(id);
    walletStore.actions.getItems({ people: currentCompany.id });
    setDeleteConfirm(null);
  };

  /* ── formas de pagamento por carteira ── */
  const openPtModal = (wallet) => {
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

  const removePaymentType = async (wptId) => {
    await walletPtStore.actions.remove(wptId);
    walletPtStore.actions.getItems({ wallet: ptModalWallet?.id });
  };

  /* ── formas ligadas a carteira aberta ── */
  const linkedPts = useMemo(() => walletPts || [], [walletPts]);

  /* ── formas disponíveis (não vinculadas ainda) ── */
  const availablePts = useMemo(() => {
    const linkedIds = linkedPts.map(wpt => {
      const ptId = typeof wpt.paymentType === 'object' ? wpt.paymentType?.id : wpt.paymentType;
      return String(ptId || '');
    });
    return (paymentTypes || []).filter(pt => !linkedIds.includes(String(pt.id)));
  }, [paymentTypes, linkedPts]);

  const freqLabel = v => FREQUENCY_OPTIONS.find(o => o.value === v)?.label || v || '-';
  const instLabel = v => INSTALLMENT_OPTIONS.find(o => o.value === v)?.label || v || '-';

  return (
    <SafeAreaView style={[ps.root, { backgroundColor: palette.background || '#F8FAFC' }]}>

      {/* cabeçalho */}
      <View style={[ps.header, { backgroundColor: '#fff', borderBottomColor: '#E2E8F0' }]}>
        <Text style={ps.headerTitle}>Carteiras</Text>
        <TouchableOpacity style={[ps.addBtn, { backgroundColor: palette.primary || '#0EA5E9' }]} onPress={openNewWallet}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={ps.addBtnText}>Nova carteira</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={ps.centered}><ActivityIndicator size="large" color={palette.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={ps.list}>
          {(!wallets || wallets.length === 0) && (
            <View style={[ps.emptyBox, cardShadow]}>
              <Icon name="credit-card" size={36} color="#CBD5E1" />
              <Text style={ps.emptyTitle}>Nenhuma carteira cadastrada</Text>
              <Text style={ps.emptySubtitle}>Clique em "Nova carteira" para começar.</Text>
            </View>
          )}
          {(wallets || []).map(w => (
            <View key={w.id} style={[ps.card, cardShadow]}>
              <View style={ps.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={ps.cardTitle}>{w.wallet}</Text>
                  {w.balance !== undefined && (
                    <Text style={[ps.cardBalance, { color: palette.primary }]}>
                      Saldo: {Formatter.formatMoney(w.balance || 0)}
                    </Text>
                  )}
                </View>
                <View style={ps.cardActions}>
                  <TouchableOpacity style={ps.iconBtn} onPress={() => openPtModal(w)}>
                    <Icon name="link" size={16} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={ps.iconBtn} onPress={() => openEditWallet(w)}>
                    <Icon name="edit-2" size={16} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[ps.iconBtn, { borderColor: '#FCA5A5' }]}
                    onPress={() => setDeleteConfirm({ type: 'wallet', id: w.id, label: w.wallet })}>
                    <Icon name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* formas vinculadas (preview) */}
              {(w.walletPaymentTypes || []).length > 0 && (
                <View style={ps.chipRow}>
                  {(w.walletPaymentTypes || []).map(wpt => {
                    const pt = typeof wpt.paymentType === 'object' ? wpt.paymentType : null;
                    if (!pt) return null;
                    return (
                      <View key={wpt.id} style={[ps.chip, { backgroundColor: withOpacity(palette.primary, 0.1) }]}>
                        <Text style={[ps.chipText, { color: palette.primary }]}>{pt.paymentType}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── modal nova/editar carteira ── */}
      <FormModal
        visible={walletModal}
        title={editingWallet ? 'Editar carteira' : 'Nova carteira'}
        onClose={() => setWalletModal(false)}
        onSave={saveWallet}
        isSaving={isSaving}
      >
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

      {/* ── modal formas de pagamento da carteira ── */}
      <Modal transparent visible={ptModal} animationType="fade" onRequestClose={() => setPtModal(false)}>
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

                <ScrollView style={{ maxHeight: 380 }}>
                  {linkedPts.length === 0 && (
                    <Text style={s.emptyMsg}>Nenhuma forma vinculada.</Text>
                  )}
                  {linkedPts.map(wpt => {
                    const pt = typeof wpt.paymentType === 'object' ? wpt.paymentType : { paymentType: '—' };
                    return (
                      <View key={wpt.id} style={s.wptRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.wptName}>{pt.paymentType}</Text>
                          <Text style={s.wptMeta}>
                            {freqLabel(pt.frequency)} · {instLabel(pt.installments)}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => removePaymentType(wpt.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Icon name="trash-2" size={15} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>

                {availablePts.length > 0 && (
                  <View style={s.addPtRow}>
                    <TouchableOpacity style={[s.addPtBtn, { borderColor: palette.primary }]}
                      onPress={() => setNewPtModal(true)}>
                      <Icon name="plus" size={14} color={palette.primary} />
                      <Text style={[s.addPtBtnText, { color: palette.primary }]}>
                        {newPtId
                          ? (paymentTypes || []).find(p => String(p.id) === String(newPtId))?.paymentType || 'Selecionar'
                          : 'Adicionar forma de pagamento'}
                      </Text>
                    </TouchableOpacity>
                    {!!newPtId && (
                      <TouchableOpacity style={[s.btnSave, { flex: 0, paddingHorizontal: 16 }]}
                        onPress={addPaymentType} disabled={isSavingWpt}>
                        {isSavingWpt
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Icon name="check" size={16} color="#fff" />}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* seletor de forma de pagamento */}
      <SelectModal
        visible={newPtModal}
        title="Selecionar forma de pagamento"
        options={(availablePts || []).map(pt => ({ value: String(pt.id), label: pt.paymentType, ...pt }))}
        selectedValue={newPtId}
        onClose={() => setNewPtModal(false)}
        onSelect={v => { setNewPtId(String(v)); setNewPtModal(false); }}
        labelKey="label"
        valueKey="value"
        searchPlaceholder="Buscar forma de pagamento"
      />

      {/* ── confirmação de exclusão ── */}
      <Modal transparent visible={!!deleteConfirm} animationType="fade" onRequestClose={() => setDeleteConfirm(null)}>
        <TouchableWithoutFeedback onPress={() => setDeleteConfirm(null)}>
          <View style={s.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[s.sheet, { minHeight: 'auto', paddingBottom: 20 }]}>
                <Text style={[s.sheetTitle, { marginBottom: 8 }]}>Confirmar exclusão</Text>
                <Text style={s.deleteMsg}>
                  Deseja excluir <Text style={{ fontWeight: '800' }}>{deleteConfirm?.label}</Text>?
                </Text>
                <View style={s.formActions}>
                  <TouchableOpacity style={s.btnCancel} onPress={() => setDeleteConfirm(null)}>
                    <Text style={s.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.btnSave, { backgroundColor: '#EF4444' }]}
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

/* ─── estilos da página ─────────────────────────────────────────────── */
const ps = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  cardBalance: { fontSize: 13, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1,
    borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
  emptyBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  emptySubtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
});

/* ─── estilos compartilhados dos modais ─────────────────────────────── */
const s = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18,
    width: '100%', maxHeight: '86%', minHeight: 260, padding: 14, ...cardShadow,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC',
  },
  searchRow: {
    height: 42, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, color: '#0F172A', fontWeight: '600' },
  optionList: { maxHeight: 360 },
  option: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12,
    minHeight: 44, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
  },
  optionActive: { borderColor: '#0EA5E9', backgroundColor: '#EAF7FF' },
  optionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  optionText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },
  optionTextActive: { color: '#0EA5E9', fontWeight: '700' },
  formField: { marginBottom: 14 },
  formLabel: {
    fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10,
    paddingHorizontal: 12, height: 44, backgroundColor: '#fff',
    color: '#0F172A', fontSize: 14, fontWeight: '600',
  },
  formActions: { flexDirection: 'row', gap: 10, paddingTop: 12 },
  btnCancel: {
    flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  btnCancelText: { fontWeight: '700', fontSize: 14, color: '#64748B' },
  btnSave: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', backgroundColor: '#0EA5E9' },
  btnSaveText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  wptRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10,
  },
  wptName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  wptMeta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  addPtRow: { flexDirection: 'row', gap: 8, paddingTop: 12, alignItems: 'center' },
  addPtBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  addPtBtnText: { fontSize: 13, fontWeight: '700' },
  emptyMsg: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 16 },
  deleteMsg: { fontSize: 14, color: '#334155', marginBottom: 4, lineHeight: 20 },
});
