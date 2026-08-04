import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, BillCard, Chip, Loading } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { getBillHistory, iconForBillCategory, type BillSummary } from '../../../services/bills';

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

export default function BillsHistoryScreen() {
  const [history, setHistory] = useState<BillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tümü');

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      getBillHistory().then((list) => {
        setHistory(list);
        setIsLoading(false);
      });
    }, [])
  );

  const months = useMemo(() => {
    const unique = new Set(history.filter((b) => b.paidAt).map((b) => monthLabel(b.paidAt!)));
    return ['Tümü', ...unique];
  }, [history]);

  const filteredHistory = history.filter((bill) => {
    if (activeFilter === 'Tümü') return true;
    return bill.paidAt && monthLabel(bill.paidAt) === activeFilter;
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

      {/* AY FİLTRESİ */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {months.map(f => (
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
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((bill) => (
              <BillCard
                key={bill.id}
                title={bill.title}
                category={bill.category}
                amount={bill.amount}
                dueDate={new Date(bill.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                payer={bill.payerName}
                status={bill.status}
                icon={iconForBillCategory(bill.category)}
                onPress={() => router.push(`/bills/${bill.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.text.secondary} align="center">
                Bu döneme ait ödenmiş fatura bulunamadı.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

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
