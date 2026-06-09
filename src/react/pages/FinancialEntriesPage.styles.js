import {Platform, StyleSheet} from 'react-native';
import {colors} from '@controleonline/../../src/styles/colors';
import {withOpacity} from '@controleonline/../../src/styles/branding';

export const createStyles = (palette = colors) => {
  const shadowColor = palette.text || colors.text;
  const shadow = Platform.select({
    ios: {
      shadowColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: {elevation: 2},
    web: {boxShadow: `0 4px 12px ${withOpacity(shadowColor, 0.06)}`},
  });

  return StyleSheet.create({
    container: {flex: 1, paddingHorizontal: 16, paddingTop: 8},
    filterBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 8,
    },
    invoiceCard: {
      borderRadius: 16,
      backgroundColor: palette.background,
      padding: 14,
      ...shadow,
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
      color: palette.text,
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
      color: palette.textSecondary,
      textTransform: 'uppercase',
      fontWeight: '700',
      marginBottom: 2,
      letterSpacing: 0.3,
    },
    invoiceValue: {
      fontSize: 13,
      color: palette.text,
      fontWeight: '600',
    },
    amountRow: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    amountLabel: {
      fontSize: 12,
      color: palette.textSecondary,
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
      color: palette.text,
    },
  });
};

const styles = createStyles(colors);

export default styles;
