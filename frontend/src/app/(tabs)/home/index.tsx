import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, IconButton, Avatar, Section } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <Screen safeArea backgroundColor={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View>
            <Text variant="h2" color={colors.text.primary}>Ev 3A</Text>
            <Text variant="caption">Temmuz 2026</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton icon="notifications-outline" onPress={() => {}} />
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileAvatar}>
              <Avatar initials="SE" size={36} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. BENIM DURUMUM (MY STATUS) */}
        <TouchableOpacity onPress={() => router.push('/debts')} activeOpacity={0.9}>
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="arrow-down-circle" size={24} color={colors.success} />
              <Text variant="body" color={colors.success} weight="bold" style={{ marginLeft: 8 }}>
                ALACAĞIN VAR
              </Text>
            </View>
            <Text variant="h1" color={colors.success} style={styles.statusAmount}>+₺850.00</Text>
            <Text variant="body" color={colors.success}>2 kişiden alacağın var.</Text>
          </Card>
        </TouchableOpacity>

        {/* 3. BU AY ÖZETİ (THIS MONTH SUMMARY) */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard} noPadding>
            <View style={styles.summaryInner}>
              <Text variant="caption">Toplam Harcama</Text>
              <Text variant="h3" color={colors.text.primary}>₺12.450</Text>
            </View>
          </Card>
          <Card style={styles.summaryCard} noPadding>
            <View style={styles.summaryInner}>
              <Text variant="caption">Toplam Fatura</Text>
              <Text variant="h3" color={colors.text.primary}>₺4.200</Text>
            </View>
          </Card>
          <Card style={styles.summaryCard} noPadding>
            <View style={styles.summaryInner}>
              <Text variant="caption">İşlem Sayısı</Text>
              <Text variant="h3" color={colors.text.primary}>27</Text>
            </View>
          </Card>
          <Card style={styles.summaryCard} noPadding>
            <View style={styles.summaryInner}>
              <Text variant="caption">Ay Sonuna</Text>
              <Text variant="h3" color={colors.text.primary}>8 gün</Text>
            </View>
          </Card>
        </View>

        {/* 4. HIZLI İŞLEMLER (QUICK ACTIONS) */}
        <View style={styles.quickActions}>
          <View style={styles.actionItem}>
            <IconButton icon="receipt" variant="solid" size={28} onPress={() => {}} />
            <Text variant="caption" align="center" style={styles.actionLabel}>Harcama{'\n'}Ekle</Text>
          </View>
          <View style={styles.actionItem}>
            <IconButton icon="document-text" variant="solid" size={28} onPress={() => router.push('/bills')} />
            <Text variant="caption" align="center" style={styles.actionLabel}>Fatura{'\n'}Ekle</Text>
          </View>
          <View style={styles.actionItem}>
            <IconButton icon="cash" variant="solid" size={28} onPress={() => router.push('/debts')} />
            <Text variant="caption" align="center" style={styles.actionLabel}>Ödeme{'\n'}Yap</Text>
          </View>
          <View style={styles.actionItem}>
            <IconButton icon="person-add" variant="solid" size={28} onPress={() => router.push('/profile')} />
            <Text variant="caption" align="center" style={styles.actionLabel}>Üye{'\n'}Davet Et</Text>
          </View>
        </View>

        {/* 5. YAKLAŞAN FATURALAR (UPCOMING BILLS) */}
        <Section 
          title="Yaklaşan Faturalar" 
          action={<Text variant="caption" color={colors.primary} weight="bold" onPress={() => router.push('/bills')}>Tümünü Gör</Text>}
        >
          <Card noPadding style={styles.listCard}>
            <View style={styles.listItem}>
              <View style={styles.listIconContainer}>
                <Ionicons name="flash" size={20} color="#FF9500" />
              </View>
              <View style={styles.listContent}>
                <Text variant="body" weight="semibold">Elektrik</Text>
                <Text variant="caption">Sorumlu: Mehmet</Text>
              </View>
              <View style={styles.listRight}>
                <Text variant="body" weight="bold">28 Tem</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.listItem}>
              <View style={styles.listIconContainer}>
                <Ionicons name="wifi" size={20} color="#007AFF" />
              </View>
              <View style={styles.listContent}>
                <Text variant="body" weight="semibold">İnternet</Text>
                <Text variant="caption">Sorumlu: Sen</Text>
              </View>
              <View style={styles.listRight}>
                <Text variant="body" weight="bold">30 Tem</Text>
              </View>
            </View>
          </Card>
        </Section>

        {/* 6. SON HARCAMALAR (RECENT EXPENSES) */}
        <Section 
          title="Son Harcamalar" 
          action={<Text variant="caption" color={colors.primary} weight="bold" onPress={() => router.push('/expenses')}>Tümünü Gör</Text>}
        >
          <Card noPadding style={styles.listCard}>
            <View style={styles.listItem}>
              <View style={[styles.listIconContainer, { backgroundColor: '#34C75920' }]}>
                <Ionicons name="cart" size={20} color="#34C759" />
              </View>
              <View style={styles.listContent}>
                <Text variant="body" weight="semibold">Migros</Text>
                <Text variant="caption">Sen ödedin</Text>
              </View>
              <View style={styles.listRight}>
                <Text variant="body" weight="bold">₺1.250</Text>
                <Text variant="caption">Dün</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.listItem}>
              <View style={[styles.listIconContainer, { backgroundColor: '#FF3B3020' }]}>
                <Ionicons name="restaurant" size={20} color="#FF3B30" />
              </View>
              <View style={styles.listContent}>
                <Text variant="body" weight="semibold">Akşam Yemeği</Text>
                <Text variant="caption">Ahmet ödedi</Text>
              </View>
              <View style={styles.listRight}>
                <Text variant="body" weight="bold">₺840</Text>
                <Text variant="caption">2 gün önce</Text>
              </View>
            </View>
          </Card>
        </Section>

        {/* 7. KÜÇÜK HARCAMA ÖZETİ (EXPENSE SUMMARY PREVIEW) */}
        <Section 
          title="Harcama Dağılımı" 
          action={<Text variant="caption" color={colors.primary} weight="bold" onPress={() => router.push('/expenses')}>Detaylı Analiz</Text>}
        >
          <Card>
            <View style={styles.summaryRow}>
              <Text variant="body" style={{ flex: 1 }}>Market</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '45%', backgroundColor: '#34C759' }]} />
              </View>
              <Text variant="body" weight="bold" style={{ width: 40, textAlign: 'right' }}>%45</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="body" style={{ flex: 1 }}>Fatura</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '30%', backgroundColor: '#FF9500' }]} />
              </View>
              <Text variant="body" weight="bold" style={{ width: 40, textAlign: 'right' }}>%30</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="body" style={{ flex: 1 }}>Temizlik</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '15%', backgroundColor: '#007AFF' }]} />
              </View>
              <Text variant="body" weight="bold" style={{ width: 40, textAlign: 'right' }}>%15</Text>
            </View>
          </Card>
        </Section>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileAvatar: {
    marginLeft: spacing.xs,
  },
  statusCard: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success + '30',
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusAmount: {
    fontSize: 40, // Özel büyük punto
    marginBottom: spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  summaryCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  summaryInner: {
    padding: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  actionItem: {
    alignItems: 'center',
    width: 70,
  },
  actionLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
  },
  listCard: {
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listContent: {
    flex: 1,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 40 + spacing.md * 2, // Ikon hizasından başlasın
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    flex: 2,
    height: 8,
    backgroundColor: colors.border + '50',
    borderRadius: radius.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
});
