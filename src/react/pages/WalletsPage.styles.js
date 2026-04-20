import { Platform, StyleSheet } from 'react-native'

const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
  android: { elevation: 2 },
  web: { boxShadow: '0 4px 12px rgba(15,23,42,0.06)' },
});

const ps = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: { fontWeight: '700', fontSize: 13 },
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

export { ps, s }

export const inlineStyle_95_24 = {
  maxHeight: 480,
};

export const inlineStyle_96_20 = {
  padding: 4,
};

export const inlineStyle_255_22 = {
  flex: 1,
};

export const inlineStyle_330_28 = {
  maxHeight: 380,
};

export const inlineStyle_338_30 = {
  flex: 1,
};

export const inlineStyle_400_39 = {
  fontWeight: '800',
};

export const inlineStyle_69_47 = {
  paddingBottom: 8,
};

