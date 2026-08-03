import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { colors, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export type DebtType = 'owe_me' | 'i_owe' | 'settled';

export interface PersonDebtCardProps {
  personName: string;
  initials: string;
  amount: number;
  openTxCount: number;
  type: DebtType;
  lastTxDate?: string;
  onPress: () => void;
  onSettlePress?: () => void;
}

export function PersonDebtCard({ 
  personName, 
  initials, 
  amount, 
  openTxCount, 
  type,
  lastTxDate,
  onPress,
  onSettlePress 
}: PersonDebtCardProps) {

  const getStatusText = () => {
    if (type === 'owe_me') return 'Sana Borçlu';
    if (type === 'i_owe') return 'Sen Borçlusun';
    return 'Hesaplar Dengede';
  };

  const getStatusColor = () => {
    if (type === 'owe_me') return colors.success;
    if (type === 'i_owe') return colors.danger;
    return colors.text.secondary;
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <Avatar initials={initials} size={48} />
          
          <View style={styles.infoContainer}>
            <Text variant="h3">{personName}</Text>
            <View style={styles.statusRow}>
              <Ionicons 
                name={type === 'owe_me' ? 'arrow-down-circle' : type === 'i_owe' ? 'arrow-up-circle' : 'checkmark-circle'} 
                size={16} 
                color={getStatusColor()} 
              />
              <Text variant="caption" color={getStatusColor()} weight="semibold" style={styles.statusText}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text variant="h2" color={getStatusColor()}>
              ₺{amount.toLocaleString('tr-TR')}
            </Text>
            {lastTxDate && (
              <Text variant="caption" color={colors.text.secondary} style={styles.dateText}>
                {lastTxDate}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text variant="caption" color={colors.text.secondary}>
            {openTxCount} Açık İşlem
          </Text>
          
          {type === 'i_owe' ? (
            <Button 
              title="Ödeme Yap" 
              variant="primary"
              onPress={() => onSettlePress?.()} 
              style={styles.actionBtn}
            />
          ) : (
            <TouchableOpacity 
              style={styles.detailBtn}
              onPress={onPress}
            >
              <Text variant="caption" weight="semibold" color={colors.primary}>Detay</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    marginLeft: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border + '50',
    paddingTop: spacing.md,
  },
  actionBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.md,
  }
});
