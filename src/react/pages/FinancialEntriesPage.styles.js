import { Platform, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  invoiceCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    ...cardShadow,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceId: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  invoiceInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  invoiceInfoCell: {
    width: '32%',
    minWidth: 180,
  },
  invoiceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  invoiceValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  amountRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  amountField: {
    flex: 1,
    minWidth: 0,
  },
  amountValue: {
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 10,
    textAlign: 'right',
    fontSize: 22,
    fontWeight: '900',
  },
});

export default styles;
