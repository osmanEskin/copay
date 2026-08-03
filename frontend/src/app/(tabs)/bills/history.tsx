import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, BillCard, Chip } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { BillStatus } from '../../../components/BillCard';

const MOCK_HISTORY = [
  { id: '10', title: 'Elektrik', category: 'Haziran 2026', amount: 980, dueDate: '28 Haziran', payer: 'Mehmet', status: 'Ödendi' as BillStatus, icon: 'flash' as const },
  { id: '11', title: 'Su', category: 'Haziran 2026', amount: 195, dueDate: '15 Haziran', payer: 'Ahmet', status: 'Ödendi' as BillStatus, icon: 'water' as const },
  { id: '12', title: 'İnternet', category: 'Mayıs 2026', amount: 350, dueDate: '30 Mayıs', payer: 'Sen', status: 'Ödendi' as BillStatus, icon: 'wifi' as const },
  { id: '13', title: 'Elektrik', category: 'Mayıs 2026', amount: 840, dueDate: '28 Mayıs', payer: 'Mehmet', status: 'Ödendi' as BillStatus, icon: 'flash' as const },
];

export default function BillsHistoryScreen() {
  const filters = ['Tümü', 'Temmuz', 'Haziran', 'Mayıs', 'Nisan'];
  const [activeFilter, setActiveFilter] = useState('Haziran');

  const filteredHistory = MOCK_HISTORY.filter(bill => {
    if (activeFilter === 'Tümü') return true;
    return bill.category.includes(activeFilter);
  });

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Geçmiş Faturalar</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* YIL FİLTRESİ */}
      <View style={styles.yearSelector}>
        <Text variant="body" weight="bold" color={colors.text.primary}>2026 Yılı</Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
      </View>

      {/* AY FİLTRESİ */}
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

      {/* LISTE */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((bill) => (
            <BillCard
              key={bill.id}
              title={bill.title}
              category={bill.category}
              amount={bill.amount}
              dueDate={bill.dueDate}
              payer={bill.payer}
              status={bill.status}
              icon={bill.icon}
              onPress={() => router.push(`/bills/${bill.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.text.secondary} align="center">
              Bu aya ait geçmiş fatura bulunamadı.
            </Text>
          </View>
        )}
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  chipsContainer: {
    marginBottom: spacing.md,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  }
});
