import {StyleSheet} from 'react-native'
import {withOpacity} from '@controleonline/../../src/styles/branding'

const createStyles = (ppcColors, brandColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: ppcColors.appBg,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    emptyText: {
      color: ppcColors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },
    content: {
      padding: 14,
      paddingBottom: 28,
      gap: 12,
    },
    summaryCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: ppcColors.borderSoft,
      backgroundColor: ppcColors.cardBg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    summaryTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    summaryTitleWrap: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    summaryEyebrow: {
      color: ppcColors.accentInfo,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    summaryTitle: {
      color: ppcColors.textPrimary,
      fontSize: 24,
      fontWeight: '900',
    },
    summarySubtitle: {
      color: ppcColors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    statusChip: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    statusChipText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.35,
      textTransform: 'uppercase',
    },
    amountText: {
      color: brandColors.primary,
      fontSize: 34,
      fontWeight: '900',
    },
    summaryMetaStack: {
      gap: 6,
    },
    summaryMetaText: {
      color: ppcColors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    summaryMetaWarning: {
      color: '#B91C1C',
      fontSize: 12,
      fontWeight: '800',
    },
    summaryMetaHighlight: {
      color: ppcColors.textPrimary,
      fontWeight: '800',
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    infoCard: {
      flexGrow: 1,
      minWidth: 150,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ppcColors.border,
      backgroundColor: ppcColors.cardBgSoft,
      paddingHorizontal: 12,
      paddingVertical: 11,
      gap: 5,
    },
    infoCardWide: {
      width: '100%',
    },
    infoHeader: {
      color: ppcColors.accentInfo,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.35,
    },
    infoValue: {
      color: ppcColors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 20,
    },
    infoValueMuted: {
      color: ppcColors.textSecondary,
    },
    sectionCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ppcColors.border,
      backgroundColor: ppcColors.cardBgSoft,
      paddingHorizontal: 12,
      paddingVertical: 11,
      gap: 10,
    },
    sectionTitle: {
      color: ppcColors.accentInfo,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    linkedOrderCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ppcColors.border,
      backgroundColor: ppcColors.cardBg,
      paddingHorizontal: 12,
      paddingVertical: 11,
      gap: 10,
    },
    linkedOrderCardCancelled: {
      borderColor: withOpacity('#DC2626', 0.5),
      backgroundColor: withOpacity('#DC2626', 0.06),
    },
    linkedOrderMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: ppcColors.borderSoft,
      paddingTop: 10,
    },
    linkedOrderMetaLabel: {
      color: ppcColors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    linkedOrderMetaValue: {
      color: ppcColors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    linkedOrderMetaValueCancelled: {
      color: '#B91C1C',
      textDecorationLine: 'line-through',
    },
    linkedOrderHint: {
      color: ppcColors.accentInfo,
      fontSize: 11,
      fontWeight: '700',
    },
    linkedOrderCancelledHint: {
      color: '#B91C1C',
      fontSize: 11,
      fontWeight: '800',
    },
    loadingState: {
      minHeight: 120,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ppcColors.border,
      backgroundColor: ppcColors.cardBgSoft,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    loadingText: {
      color: ppcColors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
  })

export default createStyles
