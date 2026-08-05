import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Input, Chip, BillCard, Loading } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import { getMyBills, iconForBillCategory, type BillSummary } from '../../../services/bills';

export default function BillsIndexScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [bills, setBills] = useState<BillSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  const filters = ['Tümü', 'Bekleyen', 'Yaklaşan', 'Geciken', 'Ödenen'];

  const loadBills = useCallback(async () => {
    setIsLoading(true);
    setLoadError(undefined);
    try {
      const [user, list] = await Promise.all([getCurrentUser(), getMyBills()]);
      setCurrentUserId(user?.id ?? null);
      setBills(list);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : 'Faturalar yüklenemedi, backend çalışıyor mu kontrol et.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills])
  );

  const filteredBills = bills.filter(bill => {
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
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => {
              const needsAmount = bill.variableAmount && bill.amount === 0;
              return (
                <BillCard
                  key={bill.id}
                  title={bill.title}
                  category={bill.category}
                  amount={needsAmount ? 'Tutar Girilmedi' : bill.amount}
                  dueDate={new Date(bill.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                  payer={bill.payerId === currentUserId ? 'Sen' : bill.payerName}
                  status={bill.status}
                  icon={iconForBillCategory(bill.category)}
                  onPress={() => router.push(`/bills/${bill.id}`)}
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.text.secondary} align="center">
                Filtrelere uygun fatura bulunamadı.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

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
    paddingBottom: 100,
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
