import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Section, Divider, Loading } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import {
  EXPENSE_CATEGORY_COLORS as CATEGORY_COLORS,
  getExpenseAnalytics,
  iconForCategory,
  type ExpenseAnalytics,
} from '../../../services/expenses';

export default function ExpensesAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getExpenseAnalytics().then((data) => {
      setAnalytics(data);
      setIsLoading(false);
    });
  }, []);

  const monthLabel = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Harcama Analizi</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading || !analytics ? (
        <Loading />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* AYLIK TOPLAM & GRAFİK */}
          <Card style={styles.mainCard}>
            <Text variant="caption" color={colors.text.secondary}>{monthLabel} Toplam Harcama</Text>
            <Text variant="h1" color={colors.primary} style={styles.totalAmount}>
              ₺{analytics.monthlyTotal.toLocaleString('tr-TR')}
            </Text>

            <View style={styles.chartContainer}>
              {analytics.dailyChart.map((item, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View style={[styles.chartBar, { height: `${Math.max(item.height, 2)}%` }]} />
                  <Text variant="caption" style={styles.chartLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </Card>

          {analytics.monthlyTotal === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.text.secondary} align="center">
                Bu ay için henüz bir harcama kaydedilmedi.
              </Text>
            </View>
          ) : (
            <>
              {/* ÖNE ÇIKANLAR */}
              <View style={styles.highlightsContainer}>
                <Card style={styles.highlightCard}>
                  <View style={[styles.highlightIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                  </View>
                  <Text variant="caption" color={colors.text.secondary}>En Çok Harcayan</Text>
                  <Text variant="body" weight="bold" numberOfLines={1}>{analytics.topSpender?.name ?? '-'}</Text>
                  <Text variant="caption" color={colors.text.primary}>
                    ₺{(analytics.topSpender?.amount ?? 0).toLocaleString('tr-TR')}
                  </Text>
                </Card>

                <Card style={styles.highlightCard}>
                  <View style={[styles.highlightIcon, { backgroundColor: '#FF950015' }]}>
                    <Ionicons name={analytics.topCategory ? iconForCategory(analytics.topCategory.name) : 'pricetag'} size={20} color="#FF9500" />
                  </View>
                  <Text variant="caption" color={colors.text.secondary}>En Çok Harcanan</Text>
                  <Text variant="body" weight="bold" numberOfLines={1}>{analytics.topCategory?.name ?? '-'}</Text>
                  <Text variant="caption" color={colors.text.primary}>
                    ₺{(analytics.topCategory?.amount ?? 0).toLocaleString('tr-TR')}
                  </Text>
                </Card>
              </View>

              {/* KATEGORİ DAĞILIMI */}
              <Section title="Kategori Dağılımı">
                <Card noPadding style={styles.categoryCard}>
                  {analytics.categories.map((cat, index) => (
                    <React.Fragment key={cat.name}>
                      <View style={styles.categoryRow}>
                        <View style={[styles.colorDot, { backgroundColor: CATEGORY_COLORS[cat.name] ?? colors.text.secondary }]} />
                        <Text variant="body" style={styles.categoryName}>{cat.name}</Text>
                        <View style={styles.progressContainer}>
                          <View style={[styles.progressBar, { width: `${cat.percentage}%`, backgroundColor: CATEGORY_COLORS[cat.name] ?? colors.text.secondary }]} />
                        </View>
                        <View style={styles.categoryRight}>
                          <Text variant="body" weight="bold">₺{cat.amount.toLocaleString('tr-TR')}</Text>
                          <Text variant="caption" color={colors.text.secondary}>%{cat.percentage}</Text>
                        </View>
                      </View>
                      {index < analytics.categories.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Card>
              </Section>
            </>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  totalAmount: {
    fontSize: 36,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    height: 120,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  chartLabel: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  highlightCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryCard: {
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    width: 80,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border + '50',
    borderRadius: radius.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
  categoryRight: {
    alignItems: 'flex-end',
    width: 60,
  }
});
