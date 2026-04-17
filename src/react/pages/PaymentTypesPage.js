import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import cs from './PaymentTypesPage.styles';

import {
  inlineStyle_35_8,
  inlineStyle_174_22,
  inlineStyle_214_64,
  inlineStyle_215_24,
  inlineStyle_269_39,
} from './PaymentTypesPage.styles';

/* ─── sombra padrão ─────────────────────────────────────────────────── */
const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

/* ─── opções de select ───────────────────────────────────────────────── */
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

const freqLabel  = v => FREQUENCY_OPTIONS.find(o => o.value === v)?.label  || v || '-';
const instLabel  = v => INSTALLMENT_OPTIONS.find(o => o.value === v)?.label || v || '-';

/* ─── chips de seleção inline ────────────────────────────────────────── */
const ChipSelect = ({ options, value, onChange, palette }) => (
  <View style={inlineStyle_35_8}>
    {options.map(opt => {
      const sel = opt.value === value;
      return (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[
            cs.chip,
            sel
              ? { backgroundColor: palette.primary || '#0EA5E9', borderColor: palette.primary || '#0EA5E9' }
              : { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
          ]}
        >
          <Text style={[cs.chipText, { color: sel ? '#fff' : '#64748B' }]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

/* ─── componente principal ───────────────────────────────────────────── */
export default function PaymentTypesPage() {
  const paymentTypeStore = useStore('paymentType');
  const peopleStore      = useStore('people');
  const themeStore       = useStore('theme');

  const { currentCompany }   = peopleStore.getters;
  const { items, isLoading, isSaving } = paymentTypeStore.getters;
  const { colors: themeColors }        = themeStore.getters;

  const palette = useMemo(
    () => resolveThemePalette({ ...themeColors, ...(currentCompany?.theme?.colors || {}) }, colors),
    [themeColors, currentCompany?.id],
  );

  const [formModal, setFormModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [name, setName]             = useState('');
  const [frequency, setFrequency]   = useState('single');
  const [installments, setInstallments] = useState('single');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterText, setFilterText] = useState('');

  useFocusEffect(useCallback(() => {
    if (!currentCompany?.id) return;
    paymentTypeStore.actions.getItems({ people: currentCompany.id });
  }, [currentCompany?.id]));

  const openNew = () => {
    setEditing(null);
    setName('');
    setFrequency('single');
    setInstallments('single');
    setFormModal(true);
  };

  const openEdit = pt => {
    setEditing(pt);
    setName(pt.paymentType || '');
    setFrequency(pt.frequency || 'single');
    setInstallments(pt.installments || 'single');
    setFormModal(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    const payload = {
      paymentType: name.trim(),
      frequency,
      installments,
    };
    if (editing) {
      await paymentTypeStore.actions.save({ id: editing.id, ...payload });
    } else {
      await paymentTypeStore.actions.save({ people: `/people/${currentCompany.id}`, ...payload });
    }
    setFormModal(false);
    paymentTypeStore.actions.getItems({ people: currentCompany.id });
  };

  const remove = async id => {
    await paymentTypeStore.actions.remove(id);
    paymentTypeStore.actions.getItems({ people: currentCompany.id });
    setDeleteConfirm(null);
  };

  const filtered = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return (items || []).filter(pt =>
      !q || String(pt.paymentType || '').toLowerCase().includes(q),
    );
  }, [items, filterText]);

  return (
    <SafeAreaView style={[cs.root, { backgroundColor: palette.background || '#F8FAFC' }]}>
      {/* cabeçalho */}
      <View style={[cs.header, { borderBottomColor: '#E2E8F0' }]}>
        <Text style={cs.headerTitle}>Formas de pagamento</Text>
        <TouchableOpacity style={[cs.addBtn, { backgroundColor: palette.primary || '#0EA5E9' }]} onPress={openNew}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={cs.addBtnText}>Nova forma</Text>
        </TouchableOpacity>
      </View>
      {/* busca */}
      <View style={cs.searchBar}>
        <Icon name="search" size={14} color="#94A3B8" />
        <TextInput
          style={cs.searchInput}
          value={filterText}
          onChangeText={setFilterText}
          placeholder="Buscar forma de pagamento..."
          placeholderTextColor="#94A3B8"
        />
        {!!filterText && (
          <TouchableOpacity onPress={() => setFilterText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="x" size={14} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <View style={cs.centered}><ActivityIndicator size="large" color={palette.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={cs.list}>
          {filtered.length === 0 && (
            <View style={[cs.emptyBox, cardShadow]}>
              <Icon name="credit-card" size={36} color="#CBD5E1" />
              <Text style={cs.emptyTitle}>
                {filterText ? 'Nenhuma forma encontrada' : 'Nenhuma forma de pagamento cadastrada'}
              </Text>
              <Text style={cs.emptySubtitle}>Clique em "Nova forma" para começar.</Text>
            </View>
          )}
          {filtered.map(pt => (
            <View key={pt.id} style={[cs.card, cardShadow]}>
              <View style={cs.cardTop}>
                <View style={inlineStyle_174_22}>
                  <Text style={cs.cardName}>{pt.paymentType}</Text>
                  <View style={cs.metaRow}>
                    <View style={[cs.metaChip, { backgroundColor: withOpacity(palette.primary, 0.09) }]}>
                      <Text style={[cs.metaChipText, { color: palette.primary }]}>{freqLabel(pt.frequency)}</Text>
                    </View>
                    <View style={[cs.metaChip, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={[cs.metaChipText, { color: '#64748B' }]}>{instLabel(pt.installments)}</Text>
                    </View>
                  </View>
                </View>
                <View style={cs.cardActions}>
                  <TouchableOpacity style={cs.iconBtn} onPress={() => openEdit(pt)}>
                    <Icon name="edit-2" size={16} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[cs.iconBtn, { borderColor: '#FCA5A5' }]}
                    onPress={() => setDeleteConfirm({ id: pt.id, label: pt.paymentType })}
                  >
                    <Icon name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {/* ── modal de formulário ── */}
      <Modal transparent visible={formModal} animationType="fade" onRequestClose={() => setFormModal(false)}>
        <TouchableWithoutFeedback onPress={() => setFormModal(false)}>
          <View style={cs.backdrop}>
            <TouchableWithoutFeedback>
              <View style={cs.sheet}>
                <View style={cs.sheetHeader}>
                  <Text style={cs.sheetTitle}>{editing ? 'Editar forma' : 'Nova forma de pagamento'}</Text>
                  <TouchableOpacity onPress={() => setFormModal(false)} style={cs.closeBtn}>
                    <Icon name="x" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" style={inlineStyle_214_64}>
                  <View style={inlineStyle_215_24}>

                    <View style={cs.formField}>
                      <Text style={cs.formLabel}>Nome *</Text>
                      <TextInput
                        style={cs.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Dinheiro, Cartão, Pix..."
                        placeholderTextColor="#94A3B8"
                        autoFocus
                      />
                    </View>

                    <View style={cs.formField}>
                      <Text style={cs.formLabel}>Frequência *</Text>
                      <ChipSelect options={FREQUENCY_OPTIONS} value={frequency} onChange={setFrequency} palette={palette} />
                    </View>

                    <View style={cs.formField}>
                      <Text style={cs.formLabel}>Parcelamento *</Text>
                      <ChipSelect options={INSTALLMENT_OPTIONS} value={installments} onChange={setInstallments} palette={palette} />
                    </View>

                  </View>
                </ScrollView>
                <View style={cs.formActions}>
                  <TouchableOpacity style={cs.btnCancel} onPress={() => setFormModal(false)}>
                    <Text style={cs.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[cs.btnSave, { backgroundColor: palette.primary || '#0EA5E9' }, isSaving && { opacity: 0.6 }]}
                    onPress={save}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={cs.btnSaveText}>Salvar</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* ── confirmação de exclusão ── */}
      <Modal transparent visible={!!deleteConfirm} animationType="fade" onRequestClose={() => setDeleteConfirm(null)}>
        <TouchableWithoutFeedback onPress={() => setDeleteConfirm(null)}>
          <View style={cs.backdrop}>
            <TouchableWithoutFeedback>
              <View style={cs.sheet}>
                <Text style={[cs.sheetTitle, { marginBottom: 8 }]}>Confirmar exclusão</Text>
                <Text style={cs.deleteMsg}>
                  Deseja excluir <Text style={inlineStyle_269_39}>{deleteConfirm?.label}</Text>?
                </Text>
                <View style={cs.formActions}>
                  <TouchableOpacity style={cs.btnCancel} onPress={() => setDeleteConfirm(null)}>
                    <Text style={cs.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[cs.btnSave, { backgroundColor: '#EF4444' }]}
                    onPress={() => remove(deleteConfirm?.id)}
                  >
                    <Text style={cs.btnSaveText}>Excluir</Text>
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
