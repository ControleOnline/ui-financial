import { Platform, StyleSheet } from 'react-native';

const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

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

export default ic;

export const inlineStyle_33_8 = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
};

export const inlineStyle_62_8 = {
  flexDirection: 'row',
  gap: 8,
};

export const inlineStyle_241_22 = {
  flex: 1,
};

export const inlineStyle_277_64 = {
  maxHeight: 500,
};

export const inlineStyle_278_24 = {
  paddingVertical: 4,
};

export const inlineStyle_349_39 = {
  fontWeight: '800',
};
