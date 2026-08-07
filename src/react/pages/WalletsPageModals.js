import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { s, inlineStyle_69_47, inlineStyle_95_24, inlineStyle_96_20 } from './WalletsPage.styles';

export const SelectModal = ({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
  labelKey = 'label',
  valueKey = 'value',
  searchPlaceholder,
}) => {
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (!visible) setSearch('');
  }, [visible]);

  const filtered = useMemo(() => {
    const term = String(search || '').trim().toLowerCase();
    if (!term) return options;
    return (options || []).filter(o =>
      String(o[labelKey] || '')
        .toLowerCase()
        .includes(term),
    );
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
                <TextInput
                  style={s.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder || 'Buscar...'}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <ScrollView style={s.optionList} contentContainerStyle={inlineStyle_69_47}>
                {(filtered || []).map(item => {
                  const val = item[valueKey];
                  const sel = String(selectedValue || '') === String(val);
                  return (
                    <TouchableOpacity
                      key={String(val)}
                      style={[s.option, sel && s.optionActive]}
                      onPress={() => {
                        onSelect(val);
                        onClose();
                      }}>
                      {!!item.color && (
                        <View style={[s.optionDot, { backgroundColor: item.color }]} />
                      )}
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

export const FormModal = ({ visible, title, onClose, onSave, isSaving, children }) => (
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
            <ScrollView style={inlineStyle_95_24} keyboardShouldPersistTaps="handled">
              <View style={inlineStyle_96_20}>{children}</View>
            </ScrollView>
            <View style={s.formActions}>
              <TouchableOpacity style={s.btnCancel} onPress={onClose}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnSave, isSaving && { opacity: 0.6 }]}
                onPress={onSave}
                disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.btnSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

export const FormField = ({ label, children }) => (
  <View style={s.formField}>
    <Text style={s.formLabel}>{label}</Text>
    {children}
  </View>
);

export const ChipSelect = ({ options, value, onChange, palette }) => (
  <View style={s.chipGroup}>
    {options.map(option => {
      const isSelected = option.value === value;
      return (
        <TouchableOpacity
          key={option.value}
          style={[
            s.choiceChip,
            isSelected
              ? { backgroundColor: palette.primary, borderColor: palette.primary }
              : null,
          ]}
          onPress={() => onChange(option.value)}>
          <Text style={[s.choiceChipText, isSelected ? { color: '#FFFFFF' } : null]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
