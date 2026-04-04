import React, { useCallback, useMemo, useState } from 'react';
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
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';

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
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
  <View style={{ flexDirection: 'row', gap: 8 }}>
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
                <View style={{ flex: 1 }}>
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

                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 500 }}>
                  <View style={{ paddingVertical: 4 }}>

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
                  Deseja excluir <Text style={{ fontWeight: '800' }}>{deleteConfirm?.label}</Text>?
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

const ic = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  tabTextActive: { fontWeight: '800' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, paddingHorizontal: 12, height: 42,
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, backgroundColor: '#fff',
  },
  searchInput: { flex: 1, color: '#0F172A', fontWeight: '600', fontSize: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 12, paddingBottom: 40, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardIcon: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1,
    borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textAlign: 'center' },
  emptySubtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: '700' },
  /* color picker */
  colorSwatch: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colorSwatchActive: { borderColor: '#0F172A' },
  colorInput: {
    height: 32, minWidth: 64, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8,
    fontSize: 13, color: '#0F172A', fontWeight: '600',
  },
  /* modal */
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18,
    width: '100%', maxHeight: '90%', minHeight: 260, padding: 14, ...cardShadow,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC',
  },
  formField: { marginBottom: 16 },
  formLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  textInput: {
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10,
    paddingHorizontal: 12, height: 44, color: '#0F172A', fontSize: 14, fontWeight: '600',
  },
  formActions: { flexDirection: 'row', gap: 10, paddingTop: 14 },
  btnCancel: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  btnCancelText: { fontWeight: '700', fontSize: 14, color: '#64748B' },
  btnSave: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', backgroundColor: '#0EA5E9' },
  btnSaveText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  deleteMsg: { fontSize: 14, color: '#334155', marginBottom: 4, lineHeight: 20 },
});
