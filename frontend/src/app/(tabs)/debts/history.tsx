import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, Chip, Divider, Avatar, Loading } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { getDebtHistory, type SettlementRecord } from '../../../services/debts';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

export default function DebtHistoryScreen() {
  const [history, setHistory] = useState<SettlementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tümü');

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      getDebtHistory().then((list) => {
        setHistory(list);
        setIsLoading(false);
      });
    }, [])
  );

  const months = useMemo(() => {
    const unique = new Set(history.map((tx) => monthLabel(tx.settledAt)));
    return ['Tümü', ...unique];
  }, [history]);

  const filteredHistory = history.filter((tx) => {
    if (activeFilter === 'Tümü') return true;
    return monthLabel(tx.settledAt) === activeFilter;
  });

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>İşlem Geçmişi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* FILTERS */}
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

      {/* LIST */}
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredHistory.length > 0 ? (
            <Card noPadding style={styles.txCard}>
              {filteredHistory.map((tx, index) => (
                <React.Fragment key={tx.id}>
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <Avatar initials={initialsOf(tx.otherUserName)} size={40} />
                      <View style={styles.txInfo}>
                        <Text variant="body" weight="semibold">
                          {tx.direction === 'paid' ? `${tx.otherUserName}'e` : `${tx.otherUserName}'den`}
                        </Text>
                        <Text variant="caption" color={colors.text.secondary}>
                          {new Date(tx.settledAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text variant="body" weight="bold" color={tx.direction === 'paid' ? colors.text.primary : colors.success}>
                        {tx.direction === 'paid' ? '-' : '+'}₺{tx.amount.toLocaleString('tr-TR')}
                      </Text>
                      <Text variant="caption" color={colors.text.secondary}>
                        {tx.direction === 'paid' ? 'ödendi' : 'alındı'}
                      </Text>
                    </View>
                  </View>
                  {index < filteredHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card>
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.text.secondary} align="center">
                Bu döneme ait işlem geçmişi bulunamadı.
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
    marginBottom: spacing.lg,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  txCard: {
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  }
});
