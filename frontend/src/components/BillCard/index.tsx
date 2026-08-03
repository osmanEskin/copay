import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { colors, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export type BillStatus = 'Bekliyor' | 'Yaklaşan' | 'Geciken' | 'Ödendi';

export interface BillCardProps {
  id?: string;
  title: string;
  category: string;
  amount: string | number;
  dueDate: string;
  payer: string;
  status: BillStatus;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function BillCard({
  title,
  category,
  amount,
  dueDate,
  payer,
  status,
  icon = 'document-text',
  onPress,
}: BillCardProps) {

  // Duruma göre renkler
  let statusColor = colors.primary;
  let statusVariant: 'default' | 'success' | 'warning' | 'danger' = 'default';
  
  if (status === 'Ödendi') {
    statusColor = colors.success;
    statusVariant = 'success';
  } else if (status === 'Geciken') {
    statusColor = colors.danger;
    statusVariant = 'danger';
  } else if (status === 'Yaklaşan') {
    statusColor = '#FF9500'; // Turuncu
    statusVariant = 'warning';
  } else if (status === 'Bekliyor') {
    statusColor = colors.primary;
    statusVariant = 'default';
  }

  const iconBgColor = statusColor + '15';

  const formattedAmount = typeof amount === 'number' 
    ? `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    : amount;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            <Ionicons name={icon} size={24} color={statusColor} />
          </View>
          <View style={styles.titleSection}>
            <Text variant="body" weight="semibold" numberOfLines={1}>{title}</Text>
            <Text variant="caption" color={colors.text.secondary}>{category}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text variant="body" weight="bold" color={colors.text.primary}>{formattedAmount}</Text>
          <Badge label={status} variant={statusVariant} style={styles.badge} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.infoBlock}>
          <Text variant="caption" color={colors.text.secondary}>Son Ödeme</Text>
          <Text variant="body" weight="medium">{dueDate}</Text>
        </View>
        <View style={styles.infoBlockRight}>
          <Text variant="caption" color={colors.text.secondary}>Sorumlu</Text>
          <View style={styles.payerContainer}>
            <Ionicons name="person" size={12} color={colors.text.secondary} />
            <Text variant="body" weight="medium" style={styles.payerText} numberOfLines={1}>
              {payer}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    // Hafif gölge
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border + '50',
    marginVertical: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flex: 1,
  },
  infoBlockRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  payerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerText: {
    marginLeft: 4,
  }
});
