import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import ic from './InvoiceCategoriesPage.styles';

import {
  inlineStyle_33_8,
  inlineStyle_62_8,
  inlineStyle_241_22,
  inlineStyle_277_64,
  inlineStyle_278_24,
  inlineStyle_349_39,
} from './InvoiceCategoriesPage.styles';

/* ─── sombra padrão ─────────────────────────────────────────────────── */
const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

/* ─── paleta de cores para seleção de cor ────────────────────────────── */
const COLOR_PRESETS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#0EA5E9', '#8B5CF6', '#EC4899',
  '#64748B', '#0F172A',
];

/* ─── contextos disponíveis para categorias de invoice ──────────────── */
const CONTEXT_OPTIONS = [
  { value: 'receiver', label: 'Receita' },
  { value: 'payer',    label: 'Despesa' },
];

/* ─── componente de seleção de cor ───────────────────────────────────── */
const ColorPicker = ({ value, onChange }) => (
  <View style={inlineStyle_33_8}>
    {COLOR_PRESETS.map(color => (
      <TouchableOpacity
        key={color}
        onPress={() => onChange(color)}
        style={[
          ic.colorSwatch,
          { backgroundColor: color },
          value === color && ic.colorSwatchActive,
        ]}
      >
        {value === color && <Icon name="check" size={14} color="#fff" />}
      </TouchableOpacity>
    ))}
    {/* input customizado */}
    <TextInput
      value={value && !COLOR_PRESETS.includes(value) ? value : ''}
      onChangeText={onChange}
      placeholder="#hex"
      placeholderTextColor="#94A3B8"
      style={[ic.colorInput, value && !COLOR_PRESETS.includes(value) && { borderColor: value }]}
      autoCapitalize="none"
      maxLength={7}
    />
  </View>
);

/* ─── chips de seleção ───────────────────────────────────────────────── */
const ChipSelect = ({ options, value, onChange, palette }) => (
  <View style={inlineStyle_62_8}>
    {options.map(opt => {
      const sel = opt.value === value;
      return (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[
            ic.chip,
            sel
              ? { backgroundColor: palette.primary || '#0EA5E9', borderColor: palette.primary || '#0EA5E9' }
              : { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
          ]}
        >
          <Text style={[ic.chipText, { color: sel ? '#fff' : '#64748B' }]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

/* ─── componente principal ───────────────────────────────────────────── */
export default function InvoiceCategoriesPage() {
  const categoriesStore = useStore('categories');
  const peopleStore     = useStore('people');
  const themeStore      = useStore('theme');

  const { currentCompany }   = peopleStore.getters;
  const { items, isLoading, isSaving } = categoriesStore.getters;
  const { colors: themeColors }        = themeStore.getters;

  const palette = useMemo(
    () => resolveThemePalette({ ...themeColors, ...(currentCompany?.theme?.colors || {}) }, colors),
    [themeColors, currentCompany?.id],
  );

  const [tab, setTab]               = useState('receiver'); // 'receiver' | 'payer'
  const [formModal, setFormModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [name, setName]             = useState('');
  const [color, setColor]           = useState('');
  const [icon, setIcon]             = useState('');
  const [context, setContext]       = useState('receiver');
  const [filterText, setFilterText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* contexto mapeado para o backend */
  const backendContext = (ctx) => ctx; // 'receiver' | 'payer' direto

  useFocusEffect(useCallback(() => {
    if (!currentCompany?.id) return;
    // carrega ambos os contextos
    categoriesStore.actions.getItems({ context: 'receiver', people: currentCompany.id });
  }, [currentCompany?.id]));

  // recarrega ao mudar de tab
  const switchTab = (t) => {
    setTab(t);
    setFilterText('');
    if (currentCompany?.id) {
      categoriesStore.actions.getItems({ context: backendContext(t), people: currentCompany.id });
    }
  };

  const openNew = () => {
    setEditing(null);
    setName('');
    setColor('');
    setIcon('');
    setContext(tab);
    setFormModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name || '');
    setColor(cat.color || '');
    setIcon(cat.icon || '');
    setContext(cat.context || tab);
    setFormModal(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      context: backendContext(context),
      color: color || null,
      icon: icon.trim() || null,
    };
    if (editing) {
      await categoriesStore.actions.save({ id: editing.id, ...payload });
    } else {
      await categoriesStore.actions.save({
        company: `/people/${currentCompany.id}`,
        ...payload,
      });
    }
    setFormModal(false);
    categoriesStore.actions.getItems({ context: backendContext(tab), people: currentCompany.id });
  };

  const remove = async (id) => {
    await categoriesStore.actions.remove(id);
    categoriesStore.actions.getItems({ context: backendContext(tab), people: currentCompany.id });
    setDeleteConfirm(null);
  };

  const filtered = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return (items || []).filter(cat =>
      !q || String(cat.name || '').toLowerCase().includes(q),
    );
  }, [items, filterText]);

  const contextLabel = (ctx) => CONTEXT_OPTIONS.find(o => o.value === ctx)?.label || ctx;

  return (
    <SafeAreaView style={[ic.root, { backgroundColor: palette.background || '#F8FAFC' }]}>
      {/* cabeçalho */}
      <View style={[ic.header, { borderBottomColor: '#E2E8F0' }]}>
        <Text style={ic.headerTitle}>Categorias financeiras</Text>
        <TouchableOpacity style={[ic.addBtn, { backgroundColor: palette.primary || '#0EA5E9' }]} onPress={openNew}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={ic.addBtnText}>Nova categoria</Text>
        </TouchableOpacity>
      </View>
      {/* tabs de contexto */}
      <View style={ic.tabRow}>
        {CONTEXT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[ic.tab, tab === opt.value && [ic.tabActive, { borderBottomColor: palette.primary }]]}
            onPress={() => switchTab(opt.value)}
          >
            <Text style={[ic.tabText, tab === opt.value && [ic.tabTextActive, { color: palette.primary }]]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* busca */}
      <View style={ic.searchBar}>
        <Icon name="search" size={14} color="#94A3B8" />
        <TextInput
          style={ic.searchInput}
          value={filterText}
          onChangeText={setFilterText}
          placeholder="Buscar categoria..."
          placeholderTextColor="#94A3B8"
        />
        {!!filterText && (
          <TouchableOpacity onPress={() => setFilterText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="x" size={14} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <View style={ic.centered}><ActivityIndicator size="large" color={palette.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={ic.list}>
          {filtered.length === 0 && (
            <View style={[ic.emptyBox, cardShadow]}>
              <Icon name="tag" size={36} color="#CBD5E1" />
              <Text style={ic.emptyTitle}>
                {filterText ? 'Nenhuma categoria encontrada' : `Nenhuma categoria de ${contextLabel(tab).toLowerCase()} cadastrada`}
              </Text>
              <Text style={ic.emptySubtitle}>Clique em "Nova categoria" para começar.</Text>
            </View>
          )}
          {filtered.map(cat => (
            <View key={cat.id} style={[ic.card, cardShadow]}>
              <View style={ic.cardTop}>
                {/* bolinha de cor */}
                <View style={[ic.colorDot, { backgroundColor: cat.color || '#CBD5E1' }]} />
                <View style={inlineStyle_241_22}>
                  <Text style={ic.cardName}>{cat.name}</Text>
                  {!!cat.icon && (
                    <Text style={ic.cardIcon}>{cat.icon}</Text>
                  )}
                </View>
                <View style={ic.cardActions}>
                  <TouchableOpacity style={ic.iconBtn} onPress={() => openEdit(cat)}>
                    <Icon name="edit-2" size={16} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[ic.iconBtn, { borderColor: '#FCA5A5' }]}
                    onPress={() => setDeleteConfirm({ id: cat.id, label: cat.name })}
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
          <View style={ic.backdrop}>
            <TouchableWithoutFeedback>
              <View style={ic.sheet}>
                <View style={ic.sheetHeader}>
                  <Text style={ic.sheetTitle}>{editing ? 'Editar categoria' : 'Nova categoria'}</Text>
                  <TouchableOpacity onPress={() => setFormModal(false)} style={ic.closeBtn}>
                    <Icon name="x" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView keyboardShouldPersistTaps="handled" style={inlineStyle_277_64}>
                  <View style={inlineStyle_278_24}>

                    <View style={ic.formField}>
                      <Text style={ic.formLabel}>Nome *</Text>
                      <TextInput
                        style={ic.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Vendas, Aluguel, Salários..."
                        placeholderTextColor="#94A3B8"
                        autoFocus
                      />
                    </View>

                    <View style={ic.formField}>
                      <Text style={ic.formLabel}>Tipo *</Text>
                      <ChipSelect
                        options={CONTEXT_OPTIONS}
                        value={context}
                        onChange={setContext}
                        palette={palette}
                      />
                    </View>

                    <View style={ic.formField}>
                      <Text style={ic.formLabel}>Cor</Text>
                      <ColorPicker value={color} onChange={setColor} />
                    </View>

                    <View style={ic.formField}>
                      <Text style={ic.formLabel}>Ícone (nome)</Text>
                      <TextInput
                        style={ic.textInput}
                        value={icon}
                        onChangeText={setIcon}
                        placeholder="Ex: shopping-cart, home..."
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                  </View>
                </ScrollView>

                <View style={ic.formActions}>
                  <TouchableOpacity style={ic.btnCancel} onPress={() => setFormModal(false)}>
                    <Text style={ic.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[ic.btnSave, { backgroundColor: palette.primary || '#0EA5E9' }, isSaving && { opacity: 0.6 }]}
                    onPress={save}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={ic.btnSaveText}>Salvar</Text>}
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
          <View style={ic.backdrop}>
            <TouchableWithoutFeedback>
              <View style={ic.sheet}>
                <Text style={[ic.sheetTitle, { marginBottom: 8 }]}>Confirmar exclusão</Text>
                <Text style={ic.deleteMsg}>
                  Deseja excluir <Text style={inlineStyle_349_39}>{deleteConfirm?.label}</Text>?
                </Text>
                <View style={ic.formActions}>
                  <TouchableOpacity style={ic.btnCancel} onPress={() => setDeleteConfirm(null)}>
                    <Text style={ic.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[ic.btnSave, { backgroundColor: '#EF4444' }]}
                    onPress={() => remove(deleteConfirm?.id)}
                  >
                    <Text style={ic.btnSaveText}>Excluir</Text>
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
