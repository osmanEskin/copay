import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Input, Chip, ExpenseCard, Button } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

// Örnek harcama verileri (tarihe göre sıralı, yeni -> eski)
const MOCK_EXPENSES = [
  { id: '1', title: 'Migros', category: 'Market', date: '12 Tem 2026', payer: 'Sen', amount: 1250, icon: 'cart' as const },
  { id: '2', title: 'Akşam Yemeği', category: 'Restoran', date: '11 Tem 2026', payer: 'Ahmet', amount: 840, icon: 'restaurant' as const },
  { id: '3', title: 'Netflix', category: 'Abonelik', date: '10 Tem 2026', payer: 'Mehmet', amount: 120, icon: 'tv' as const },
  { id: '4', title: 'Taksi', category: 'Ulaşım', date: '08 Tem 2026', payer: 'Sen', amount: 350, icon: 'car' as const },
  { id: '5', title: 'Kahve', category: 'Kafe', date: '07 Tem 2026', payer: 'Ayşe', amount: 180, icon: 'cafe' as const },
];

export default function ExpensesIndexScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const categories = ['Tümü', 'Market', 'Restoran', 'Abonelik', 'Ulaşım', 'Kafe'];

  const filteredExpenses = MOCK_EXPENSES.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'Tümü' || exp.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER & ANALYTICS BUTTON */}
      <View style={styles.header}>
        <Text variant="h1" color={colors.text.primary}>Harcamalar</Text>
        <TouchableOpacity 
          style={styles.analyticsButton} 
          onPress={() => router.push('/expenses/analytics')}
        >
          <Ionicons name="pie-chart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH & FILTERS */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Input 
            placeholder="Harcamalarda ara..." 
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
          {categories.map(cat => (
            <Chip 
              key={cat} 
              label={cat} 
              active={activeCategory === cat} 
              onPress={() => setActiveCategory(cat)} 
            />
          ))}
        </ScrollView>
      </View>

      {/* EXPENSE LIST */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.listContent}
      >
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              title={expense.title}
              category={expense.category}
              date={expense.date}
              payer={expense.payer}
              amount={expense.amount}
              icon={expense.icon}
              onPress={() => router.push(`/expenses/${expense.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.text.secondary} align="center">
              Arama kriterlerine uygun harcama bulunamadı.
            </Text>
          </View>
        )}

        {filteredExpenses.length > 0 && (
          <View style={styles.paginationContainer}>
            <Button title="Daha Fazla Yükle" variant="outline" onPress={() => {}} />
          </View>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/expenses/new')}
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
  analyticsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    marginBottom: -spacing.md,
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
  paginationContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
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
