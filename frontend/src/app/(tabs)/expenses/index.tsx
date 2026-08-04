import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Input, Chip, ExpenseCard, Loading } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import { getMyExpenses, iconForCategory, type ExpenseSummary } from '../../../services/expenses';

const CATEGORY_FILTERS = ['Tümü', 'Market', 'Restoran', 'Abonelik', 'Ulaşım', 'Kafe', 'Diğer'];

export default function ExpensesIndexScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    setLoadError(undefined);
    try {
      const [user, list] = await Promise.all([getCurrentUser(), getMyExpenses()]);
      setCurrentUserId(user?.id ?? null);
      setExpenses(list);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : 'Harcamalar yüklenemedi, backend çalışıyor mu kontrol et.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const filteredExpenses = expenses.filter((exp) => {
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
      </View>

      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {CATEGORY_FILTERS.map(cat => (
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
      {isLoading ? (
        <Loading />
      ) : loadError ? (
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.danger} align="center">{loadError}</Text>
        </View>
      ) : (
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
                date={new Date(expense.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                payer={expense.payerId === currentUserId ? 'Sen' : expense.payerName}
                amount={expense.amount}
                icon={iconForCategory(expense.category)}
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
        </ScrollView>
      )}

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
