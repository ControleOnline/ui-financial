import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
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
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import { resolveThemePalette, withOpacity } from '@controleonline/../../src/styles/branding';
import { colors } from '@controleonline/../../src/styles/colors';
import ic, {
  inlineStyle_33_8,
  inlineStyle_62_8,
  inlineStyle_277_64,
  inlineStyle_278_24,
  inlineStyle_349_39,
} from './InvoiceCategoriesPage.styles';

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

const COLOR_PRESETS = [
  '#c10015',
  '#F97316',
  '#EAB308',
  '#10b981',
  '#14B8A6',
  '#0EA5E9',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
  '#0F172A',
];

const CONTEXT_OPTIONS = [
  { value: 'receiver', label: 'Receita' },
  { value: 'payer', label: 'Despesa' },
];

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
        ]}>
        {value === color && <Icon name="check" size={14} color="#fff" />}
      </TouchableOpacity>
    ))}
    <TextInput
      value={value && !COLOR_PRESETS.includes(value) ? value : ''}
      onChangeText={onChange}
      placeholder="#hex"
      placeholderTextColor="#94A3B8"
      style={[ic.textInput, inlineStyle_62_8]}
      autoCapitalize="none"
    />
  </View>
);

const ChipSelect = ({ options, value, onChange, palette }) => (
  <View style={ic.chipGroup}>
    {options.map(opt => {
      const sel = opt.value === value;
      return (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[
            ic.chip,
            sel
              ? { backgroundColor: palette.primary, borderColor: palette.primary }
              : { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
          ]}>
          <Text style={[ic.chipText, { color: sel ? '#fff' : '#64748B' }]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const backendContext = ctx => (ctx === 'receiver' ? 'receive' : ctx);
const frontendContext = ctx => (ctx === 'receive' ? 'receiver' : ctx);

export default function InvoiceCategoriesPage({ route }) {
  const categoriesStore = useStore('categories');
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');

  const { currentCompany } = peopleStore.getters || {};
  const { isSaving } = categoriesStore.getters || {};
  const { colors: themeColors } = themeStore.getters || {};

  const palette = useMemo(
    () =>
      resolveThemePalette(
        { ...themeColors, ...(currentCompany?.theme?.colors || {}) },
        colors,
      ),
    [themeColors, currentCompany?.id],
  );

  const routeContext = useMemo(
    () => CONTEXT_OPTIONS.find(option => option.value === route?.params?.context)?.value || null,
    [route?.params?.context],
  );
  const isContextLocked = Boolean(routeContext && route?.params?.lockContext !== false);
  const activeContext = isContextLocked ? routeContext : null;
  const lockedContextLabel =
    route?.params?.contextLabel ||
    CONTEXT_OPTIONS.find(option => option.value === routeContext)?.label ||
    '';
  const pageTitle =
    route?.params?.title ||
    (isContextLocked
      ? `Categorias de ${CONTEXT_OPTIONS.find(option => option.value === routeContext)?.label.toLowerCase()}`
      : 'Categorias financeiras');

  const [tab, setTab] = useState(activeContext || 'receiver');
  const [formModal, setFormModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');
  const [context, setContext] = useState(activeContext || 'receiver');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const requestParams = useMemo(
    () =>
      currentCompany?.id
        ? {
            context: backendContext(activeContext || tab),
            company: currentCompany.id,
          }
        : {},
    [activeContext, currentCompany?.id, tab],
  );

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id) return;
      categoriesStore.actions.getItems({
        context: backendContext(activeContext || tab),
        company: currentCompany.id,
      });
    }, [activeContext, currentCompany?.id, tab]),
  );

  const switchTab = t => {
    if (isContextLocked) return;
    setTab(t);
    if (currentCompany?.id) {
      categoriesStore.actions.getItems({
        context: backendContext(t),
        company: currentCompany.id,
      });
    }
  };

  const openNew = () => {
    setEditing(null);
    setName('');
    setColor('');
    setIcon('');
    setContext(activeContext || tab);
    setFormModal(true);
  };

  const openEdit = cat => {
    setEditing(cat);
    setName(cat.name || '');
    setColor(cat.color || '');
    setIcon(cat.icon || '');
    setContext(activeContext || frontendContext(cat.context) || tab);
    setFormModal(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    const nextContext = activeContext || context;
    const payload = {
      name: name.trim(),
      context: backendContext(nextContext),
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
    categoriesStore.actions.getItems({
      context: backendContext(activeContext || tab),
      company: currentCompany.id,
    });
  };

  const remove = async id => {
    await categoriesStore.actions.remove(id);
    categoriesStore.actions.getItems({
      context: backendContext(activeContext || tab),
      company: currentCompany.id,
    });
    setDeleteConfirm(null);
  };

  const contextLabel = ctx =>
    CONTEXT_OPTIONS.find(o => o.value === frontendContext(ctx))?.label || ctx;

  const renderCategoryCard = useCallback(({ item: cat }) => {
    if (!cat) return null;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[ic.colorDot, { backgroundColor: cat.color || '#CBD5E1' }]} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={ic.cardName}>{cat.name}</Text>
          {!!cat.icon && <Text style={ic.cardIcon}>{cat.icon}</Text>}
        </View>
      </View>
    );
  }, []);

  const rowActionsComponent = useCallback(
    ({ row }) => (
      <View style={ic.cardActions}>
        <TouchableOpacity style={ic.iconBtn} onPress={() => openEdit(row)}>
          <Icon name="edit-2" size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[ic.iconBtn, { borderColor: '#FCA5A5' }]}
          onPress={() => setDeleteConfirm({ id: row.id, label: row.name })}>
          <Icon name="trash-2" size={16} color="#c10015" />
        </TouchableOpacity>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={[ic.root, { backgroundColor: palette.background }]}>
      <View style={[ic.header, { borderBottomColor: '#E2E8F0' }]}>
        <Text style={ic.headerTitle}>{pageTitle}</Text>
        <TouchableOpacity
          style={[ic.addBtn, { backgroundColor: themeColors.buttonBackground }]}
          onPress={openNew}>
          <Icon name="plus" size={16} color={themeColors.buttonIcon} />
          <Text style={[ic.addBtnText, { color: themeColors.buttonText }]}>Nova categoria</Text>
        </TouchableOpacity>
      </View>

      {!isContextLocked ? (
        <View style={ic.tabRow}>
          {CONTEXT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                ic.tab,
                tab === opt.value && [ic.tabActive, { borderBottomColor: palette.primary }],
              ]}
              onPress={() => switchTab(opt.value)}>
              <Text
                style={[
                  ic.tabText,
                  tab === opt.value && [ic.tabTextActive, { color: palette.primary }],
                ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={ic.lockedContextRow}>
          <View
            style={[
              ic.lockedContextBadge,
              { backgroundColor: withOpacity(palette.primary, 0.12) },
            ]}>
            <Icon name="lock" size={13} color={palette.primary} />
            <Text style={[ic.lockedContextText, { color: palette.primary }]}>
              {lockedContextLabel}
            </Text>
          </View>
        </View>
      )}

      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 4 }}>
        <DefaultTable
          key={`categories-${activeContext || tab}-${currentCompany?.id || 'x'}`}
          storeName="categories"
          requestParams={requestParams}
          initialViewMode="cards"
          forceCardsOnCompact
          add
          onAdd={openNew}
          onEditRow={openEdit}
          onRowPress={openEdit}
          showRowActions
          pinRowActions
          rowActionsComponent={rowActionsComponent}
          renderCard={renderCategoryCard}
          searchProps={{
            compact: true,
            placeholder: 'Buscar categoria...',
            searchKey: 'search',
            storeName: 'categories',
          }}
          totalItemsLabel="categories"
          visibleColumnsPreferenceKey={`invoice-categories-${activeContext || tab}`}
          accentColor={palette.primary}
        />
      </View>

      <Modal
        transparent
        visible={formModal}
        animationType="fade"
        onRequestClose={() => setFormModal(false)}>
        <TouchableWithoutFeedback onPress={() => setFormModal(false)}>
          <View style={ic.backdrop}>
            <TouchableWithoutFeedback>
              <View style={ic.sheet}>
                <View style={ic.sheetHeader}>
                  <Text style={ic.sheetTitle}>
                    {editing ? 'Editar categoria' : 'Nova categoria'}
                  </Text>
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
                    {!isContextLocked ? (
                      <View style={ic.formField}>
                        <Text style={ic.formLabel}>Tipo *</Text>
                        <ChipSelect
                          options={CONTEXT_OPTIONS}
                          value={context}
                          onChange={setContext}
                          palette={palette}
                        />
                      </View>
                    ) : (
                      <View style={ic.formField}>
                        <Text style={ic.formLabel}>Tipo *</Text>
                        <View style={ic.lockedField}>
                          <Text style={ic.lockedFieldText}>{lockedContextLabel}</Text>
                        </View>
                      </View>
                    )}
                    <View style={ic.formField}>
                      <Text style={ic.formLabel}>Cor</Text>
                      <ColorPicker value={color} onChange={setColor} />
                    </View>
                    <View style={ic.formField}>
                      <Text style={ic.formLabel}>Ícone</Text>
                      <TextInput
                        style={ic.textInput}
                        value={icon}
                        onChangeText={setIcon}
                        placeholder="Ex: shopping-cart, home..."
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </ScrollView>
                <View style={ic.formActions}>
                  <TouchableOpacity style={ic.btnCancel} onPress={() => setFormModal(false)}>
                    <Text style={ic.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      ic.btnSave,
                      { backgroundColor: palette.primary },
                      isSaving && { opacity: 0.6 },
                    ]}
                    onPress={save}
                    disabled={isSaving}>
                    {isSaving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={ic.btnSaveText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent
        visible={!!deleteConfirm}
        animationType="fade"
        onRequestClose={() => setDeleteConfirm(null)}>
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
                    style={[ic.btnSave, { backgroundColor: '#c10015' }]}
                    onPress={() => remove(deleteConfirm?.id)}>
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
