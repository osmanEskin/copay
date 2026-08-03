import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Input, Chip, BillCard, Button } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { BillStatus } from '../../../components/BillCard';

// Örnek fatura verileri
const MOCK_BILLS = [
  { id: '1', title: 'Elektrik', category: 'Fatura', amount: 1240, dueDate: '28 Temmuz', payer: 'Mehmet', status: 'Bekliyor' as BillStatus, icon: 'flash' as const },
  { id: '2', title: 'İnternet', category: 'Abonelik', amount: 350, dueDate: '30 Temmuz', payer: 'Sen', status: 'Yaklaşan' as BillStatus, icon: 'wifi' as const },
  { id: '3', title: 'Su', category: 'Fatura', amount: 210, dueDate: '15 Temmuz', payer: 'Ahmet', status: 'Geciken' as BillStatus, icon: 'water' as const },
  { id: '4', title: 'Doğalgaz', category: 'Fatura', amount: 80, dueDate: '10 Temmuz', payer: 'Ayşe', status: 'Ödendi' as BillStatus, icon: 'flame' as const },
];

export default function BillsIndexScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');

  const filters = ['Tümü', 'Bekleyen', 'Yaklaşan', 'Geciken', 'Ödenen'];

  const filteredBills = MOCK_BILLS.filter(bill => {
    const matchesSearch = bill.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (activeFilter === 'Bekleyen') matchesStatus = bill.status === 'Bekliyor';
    if (activeFilter === 'Yaklaşan') matchesStatus = bill.status === 'Yaklaşan';
    if (activeFilter === 'Geciken') matchesStatus = bill.status === 'Geciken';
    if (activeFilter === 'Ödenen') matchesStatus = bill.status === 'Ödendi';

    return matchesSearch && matchesStatus;
  });

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER & TOP NAVIGATION */}
      <View style={styles.header}>
        <Text variant="h1" color={colors.text.primary}>Faturalar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push('/bills/recurring')}
          >
            <Ionicons name="repeat" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push('/bills/history')}
          >
            <Ionicons name="time-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH & FILTERS */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Input 
            placeholder="Faturalarda ara..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="filter" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

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

      {/* BILL LIST */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.listContent}
      >
        {filteredBills.length > 0 ? (
          filteredBills.map((bill) => (
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
              Filtrelere uygun fatura bulunamadı.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/bills/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

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
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    marginBottom: -spacing.md, // Input'un varsayılan margin'ini yok etmek için
  },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingBottom: 100, // FAB için boşluk
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }
});
