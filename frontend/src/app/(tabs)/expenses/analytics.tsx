import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Avatar, Section, Divider } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ExpensesAnalyticsScreen() {
  
  // Mock veri
  const monthlyTotal = 16450;
  const topSpender = { name: 'Ahmet', amount: 8200, initials: 'AH' };
  const topCategory = { name: 'Market', amount: 6500, percentage: 40, icon: 'cart' as const };
  
  const categories = [
    { name: 'Market', amount: 6500, percentage: 40, color: '#34C759' },
    { name: 'Restoran', amount: 4100, percentage: 25, color: '#FF9500' },
    { name: 'Faturalar', amount: 3290, percentage: 20, color: '#007AFF' },
    { name: 'Ulaşım', amount: 1645, percentage: 10, color: '#5856D6' },
    { name: 'Diğer', amount: 915, percentage: 5, color: '#8E8E93' },
  ];

  // Günlük grafik için mock veri (7 günlük çubuklar)
  const dailyChart = [
    { day: 'Pzt', height: 30 },
    { day: 'Sal', height: 50 },
    { day: 'Çar', height: 20 },
    { day: 'Per', height: 80 },
    { day: 'Cum', height: 40 },
    { day: 'Cmt', height: 100 },
    { day: 'Paz', height: 60 },
  ];

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* AYLIK TOPLAM & GRAFİK */}
        <Card style={styles.mainCard}>
          <Text variant="caption" color={colors.text.secondary}>Temmuz 2026 Toplam Harcama</Text>
          <Text variant="h1" color={colors.primary} style={styles.totalAmount}>
            ₺{monthlyTotal.toLocaleString('tr-TR')}
          </Text>

          {/* Basit Çubuk Grafik */}
          <View style={styles.chartContainer}>
            {dailyChart.map((item, index) => (
              <View key={index} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: `${item.height}%` }]} />
                <Text variant="caption" style={styles.chartLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ÖNE ÇIKANLAR */}
        <View style={styles.highlightsContainer}>
          <Card style={styles.highlightCard}>
            <View style={[styles.highlightIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="trophy-outline" size={20} color={colors.primary} />
            </View>
            <Text variant="caption" color={colors.text.secondary}>En Çok Harcayan</Text>
            <Text variant="body" weight="bold" numberOfLines={1}>{topSpender.name}</Text>
            <Text variant="caption" color={colors.text.primary}>₺{topSpender.amount.toLocaleString()}</Text>
          </Card>
          
          <Card style={styles.highlightCard}>
            <View style={[styles.highlightIcon, { backgroundColor: '#FF950015' }]}>
              <Ionicons name={topCategory.icon} size={20} color="#FF9500" />
            </View>
            <Text variant="caption" color={colors.text.secondary}>En Çok Harcanan</Text>
            <Text variant="body" weight="bold" numberOfLines={1}>{topCategory.name}</Text>
            <Text variant="caption" color={colors.text.primary}>₺{topCategory.amount.toLocaleString()}</Text>
          </Card>
        </View>

        {/* KATEGORİ DAĞILIMI */}
        <Section title="Kategori Dağılımı">
          <Card noPadding style={styles.categoryCard}>
            {categories.map((cat, index) => (
              <React.Fragment key={cat.name}>
                <View style={styles.categoryRow}>
                  <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                  <Text variant="body" style={styles.categoryName}>{cat.name}</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
                  </View>
                  <View style={styles.categoryRight}>
                    <Text variant="body" weight="bold">₺{cat.amount.toLocaleString()}</Text>
                    <Text variant="caption" color={colors.text.secondary}>%{cat.percentage}</Text>
                  </View>
                </View>
                {index < categories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Section>

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
