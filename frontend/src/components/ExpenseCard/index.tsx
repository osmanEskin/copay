import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../Text';
import { colors, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export interface ExpenseCardProps {
  id?: string;
  title: string;
  category: string;
  date: string;
  payer: string;
  amount: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function ExpenseCard({
  title,
  category,
  date,
  payer,
  amount,
  icon = 'cart',
  onPress,
}: ExpenseCardProps) {
  // Rastgele pastel bir renk üretmek için basit bir hash mantığı (kategoriye göre renk)
  // Şimdilik sabit bir renk kullanıyoruz veya gri
  const iconBgColor = colors.primary + '15';
  const iconColor = colors.primary;

  const formattedAmount = typeof amount === 'number' 
    ? `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    : amount;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text variant="body" weight="semibold" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text variant="body" weight="bold" color={colors.text.primary}>
            {formattedAmount}
          </Text>
        </View>
        
        <View style={styles.bottomRow}>
          <View style={styles.leftDetails}>
            <Text variant="caption" color={colors.text.secondary}>
              {category} • {date}
            </Text>
          </View>
          <View style={styles.payerContainer}>
            <Ionicons name="person" size={12} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary} style={styles.payerText} numberOfLines={1}>
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
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    // Hafif gölge
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    marginRight: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftDetails: {
    flex: 1,
  },
  payerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  payerText: {
    marginLeft: 4,
    maxWidth: 80,
  }
});
