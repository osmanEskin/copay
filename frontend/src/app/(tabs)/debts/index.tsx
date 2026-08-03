import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Chip, PersonDebtCard } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { DebtType } from '../../../components/PersonDebtCard';

const MOCK_DEBTS = [
  { id: '1', name: 'Ahmet', initials: 'AH', type: 'owe_me' as DebtType, amount: 540, openTxCount: 3, lastTxDate: '18 Tem' },
  { id: '2', name: 'Mehmet', initials: 'ME', type: 'i_owe' as DebtType, amount: 320, openTxCount: 2, lastTxDate: '12 Tem' },
  { id: '3', name: 'Ayşe', initials: 'AY', type: 'owe_me' as DebtType, amount: 150, openTxCount: 1, lastTxDate: '10 Tem' },
];

export default function DebtsIndexScreen() {
  const [activeFilter, setActiveFilter] = useState('Tümü');

  const filters = ['Tümü', 'Alacaklarım', 'Borçlarım'];

  // Calculate Net Total
  const totalOweMe = MOCK_DEBTS.filter(d => d.type === 'owe_me').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIOwe = MOCK_DEBTS.filter(d => d.type === 'i_owe').reduce((acc, curr) => acc + curr.amount, 0);
  
  const netBalance = totalOweMe - totalIOwe;

  const filteredDebts = MOCK_DEBTS.filter(debt => {
    if (activeFilter === 'Alacaklarım') return debt.type === 'owe_me';
    if (activeFilter === 'Borçlarım') return debt.type === 'i_owe';
    return true;
  });

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER & TOP NAVIGATION */}
      <View style={styles.header}>
        <Text variant="h1" color={colors.text.primary}>Borçlar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push('/debts/history')}
          >
            <Ionicons name="time-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* TOPLAM DURUM KARTI */}
        <Card style={[
          styles.statusCard, 
          { backgroundColor: netBalance > 0 ? colors.success + '15' : netBalance < 0 ? colors.danger + '15' : colors.surface }
        ]}>
          <View style={styles.statusInner}>
            <View style={styles.statusIconBox}>
              <Ionicons 
                name={netBalance > 0 ? 'arrow-down-outline' : netBalance < 0 ? 'arrow-up-outline' : 'checkmark-done-outline'} 
                size={32} 
                color={netBalance > 0 ? colors.success : netBalance < 0 ? colors.danger : colors.text.secondary} 
              />
            </View>
            <View style={styles.statusTextContainer}>
              <Text variant="caption" weight="semibold" color={colors.text.secondary} style={styles.statusLabel}>
                {netBalance > 0 ? 'TOPLAM ALACAĞIN' : netBalance < 0 ? 'TOPLAM BORCUN' : 'NET DURUM'}
              </Text>
              {netBalance === 0 ? (
                <Text variant="h2" color={colors.text.primary}>Hesaplar Dengede</Text>
              ) : (
                <Text variant="h1" color={netBalance > 0 ? colors.success : colors.danger} style={{ fontSize: 32 }}>
                  ₺{Math.abs(netBalance).toLocaleString('tr-TR')}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* FİLTRELER */}
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
            {filters.map(f => (
              <Chip 
                key={f} 
                label={f} 
                active={activeFilter === f} 
                onPress={() => setActiveFilter(f)} 
              />
            ))}
          </ScrollView>
        </View>

        {/* KİŞİ KARTLARI (BORÇ LİSTESİ) */}
        <View style={styles.listContainer}>
          {filteredDebts.length > 0 ? (
            filteredDebts.map((debt) => (
              <PersonDebtCard
                key={debt.id}
                personName={debt.name}
                initials={debt.initials}
                amount={debt.amount}
                openTxCount={debt.openTxCount}
                type={debt.type}
                lastTxDate={debt.lastTxDate}
                onPress={() => router.push(`/debts/${debt.id}`)}
                onSettlePress={() => router.push(`/debts/${debt.id}/settle`)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.text.secondary} align="center">
                Bu filtreye uygun borç kaydı bulunamadı.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  statusCard: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  statusLabel: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  chipsContainer: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg, // Tam ekrana yayılması için
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContainer: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
