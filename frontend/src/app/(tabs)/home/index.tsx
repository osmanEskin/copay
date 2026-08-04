import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, IconButton, Avatar, Section, Modal, Loading, Button } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../../../services/auth';
import { getMyGroups, type Group } from '../../../services/groups';
import {
  EXPENSE_CATEGORY_COLORS,
  getExpenseAnalytics,
  getMyExpenses,
  iconForCategory,
  type ExpenseAnalytics,
  type ExpenseSummary,
} from '../../../services/expenses';
import { getMyBills, iconForBillCategory, type BillSummary } from '../../../services/bills';
import { getMyDebts, type PersonDebt } from '../../../services/debts';
import { getNotifications, type NotificationsResponse } from '../../../services/notifications';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

function daysLeftInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
}

export default function HomeScreen() {
  const [myName, setMyName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const [expensesList, setExpensesList] = useState<ExpenseSummary[]>([]);
  const [billsList, setBillsList] = useState<BillSummary[]>([]);
  const [debtsList, setDebtsList] = useState<PersonDebt[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [notifications, setNotifications] = useState<NotificationsResponse>({ upcoming: [], recent: [] });

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        setIsLoadingGroups(true);
        const [user, groups] = await Promise.all([getCurrentUser(), getMyGroups()]);
        if (!active) return;
        if (user) {
          setCurrentUserId(user.id);
          setMyName(user.name);
        }
        setMyGroups(groups);
        setIsLoadingGroups(false);

        const activeId = selectedGroupId && groups.some((g) => g.id === selectedGroupId)
          ? selectedGroupId
          : groups[0]?.id ?? null;
        if (activeId !== selectedGroupId) setSelectedGroupId(activeId);

        if (activeId) {
          setIsLoadingData(true);
          const [exp, bl, dbt, an] = await Promise.all([
            getMyExpenses(activeId),
            getMyBills(activeId),
            getMyDebts(activeId),
            getExpenseAnalytics(activeId),
          ]);
          if (!active) return;
          setExpensesList(exp);
          setBillsList(bl);
          setDebtsList(dbt);
          setAnalytics(an);
          setIsLoadingData(false);
        } else {
          setIsLoadingData(false);
        }

        getNotifications().then((res) => {
          if (active) setNotifications(res);
        });
      })();

      return () => {
        active = false;
      };
    }, [selectedGroupId])
  );

  const selectedGroup = myGroups.find((g) => g.id === selectedGroupId);
  const monthLabel = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const monthPrefix = new Date().toISOString().slice(0, 7);

  const totalOweMe = debtsList.filter((d) => d.type === 'owe_me').reduce((acc, d) => acc + d.amount, 0);
  const totalIOwe = debtsList.filter((d) => d.type === 'i_owe').reduce((acc, d) => acc + d.amount, 0);
  const netBalance = totalOweMe - totalIOwe;
  const creditorCount = debtsList.filter((d) => d.type === 'owe_me').length;
  const debtorCount = debtsList.filter((d) => d.type === 'i_owe').length;

  const expensesThisMonth = expensesList.filter((e) => e.date.startsWith(monthPrefix));
  const billsThisMonth = billsList.filter((b) => b.billDate.startsWith(monthPrefix));
  const totalExpensesThisMonth = expensesThisMonth.reduce((acc, e) => acc + e.amount, 0);
  const totalBillsThisMonth = billsThisMonth.reduce((acc, b) => acc + b.amount, 0);
  const txCountThisMonth = expensesThisMonth.length + billsThisMonth.length;

  const upcomingBills = billsList.filter((b) => b.status !== 'Ödendi').slice(0, 2);
  const recentExpenses = expensesList.slice(0, 2);
  const notificationCount = notifications.upcoming.length + notifications.recent.length;

  if (isLoadingGroups) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  if (myGroups.length === 0) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.text.secondary} />
          <Text variant="h2" align="center" style={styles.emptyTitle}>Henüz bir grubun yok</Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.emptyDescription}>
            Bir grup oluşturarak veya bir gruba katılarak harcama ve fatura takibine başla.
          </Text>
          <Button title="Grup Yönetimine Git" onPress={() => router.push('/profile/group')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea backgroundColor={colors.background}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 1. HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setGroupModalVisible(true)} activeOpacity={0.7} style={{ flex: 1 }}>
            <View style={styles.groupTitleRow}>
              <Text variant="h2" color={colors.text.primary} numberOfLines={1}>{selectedGroup?.name ?? 'Grup Seç'}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.text.secondary} style={{ marginLeft: 4 }} />
            </View>
            <Text variant="caption">{monthLabel}</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <View style={styles.notifButton}>
              <IconButton icon="notifications-outline" onPress={() => setNotifModalVisible(true)} />
              {notificationCount > 0 && <View style={styles.notifDot} />}
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileAvatar}>
              <Avatar initials={myName ? initialsOf(myName) : '?'} size={36} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoadingData ? (
          <Loading />
        ) : (
          <>
            {/* 2. BENIM DURUMUM (MY STATUS) */}
            <TouchableOpacity onPress={() => router.push('/debts')} activeOpacity={0.9}>
              <Card style={[
                styles.statusCard,
                {
                  backgroundColor: netBalance > 0 ? colors.success + '15' : netBalance < 0 ? colors.danger + '15' : colors.surface,
                  borderColor: netBalance > 0 ? colors.success + '30' : netBalance < 0 ? colors.danger + '30' : colors.border,
                },
              ]}>
                <View style={styles.statusHeader}>
                  <Ionicons
                    name={netBalance > 0 ? 'arrow-down-circle' : netBalance < 0 ? 'arrow-up-circle' : 'checkmark-done-circle'}
                    size={24}
                    color={netBalance > 0 ? colors.success : netBalance < 0 ? colors.danger : colors.text.secondary}
                  />
                  <Text
                    variant="body"
                    color={netBalance > 0 ? colors.success : netBalance < 0 ? colors.danger : colors.text.secondary}
                    weight="bold"
                    style={{ marginLeft: 8 }}
                  >
                    {netBalance > 0 ? 'ALACAĞIN VAR' : netBalance < 0 ? 'BORCUN VAR' : 'HESAPLAR DENGEDE'}
                  </Text>
                </View>
                {netBalance !== 0 && (
                  <Text
                    variant="h1"
                    color={netBalance > 0 ? colors.success : colors.danger}
                    style={styles.statusAmount}
                  >
                    {netBalance > 0 ? '+' : '-'}₺{Math.abs(netBalance).toLocaleString('tr-TR')}
                  </Text>
                )}
                <Text variant="body" color={netBalance > 0 ? colors.success : netBalance < 0 ? colors.danger : colors.text.secondary}>
                  {netBalance > 0
                    ? `${creditorCount} kişiden alacağın var.`
                    : netBalance < 0
                    ? `${debtorCount} kişiye borçlusun.`
                    : 'Herkesle hesabın dengede.'}
                </Text>
              </Card>
            </TouchableOpacity>

            {/* 3. BU AY ÖZETİ (THIS MONTH SUMMARY) */}
            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard} noPadding>
                <View style={styles.summaryInner}>
                  <Text variant="caption">Toplam Harcama</Text>
                  <Text variant="h3" color={colors.text.primary}>₺{totalExpensesThisMonth.toLocaleString('tr-TR')}</Text>
                </View>
              </Card>
              <Card style={styles.summaryCard} noPadding>
                <View style={styles.summaryInner}>
                  <Text variant="caption">Toplam Fatura</Text>
                  <Text variant="h3" color={colors.text.primary}>₺{totalBillsThisMonth.toLocaleString('tr-TR')}</Text>
                </View>
              </Card>
              <Card style={styles.summaryCard} noPadding>
                <View style={styles.summaryInner}>
                  <Text variant="caption">İşlem Sayısı</Text>
                  <Text variant="h3" color={colors.text.primary}>{txCountThisMonth}</Text>
                </View>
              </Card>
              <Card style={styles.summaryCard} noPadding>
                <View style={styles.summaryInner}>
                  <Text variant="caption">Ay Sonuna</Text>
                  <Text variant="h3" color={colors.text.primary}>{daysLeftInMonth()} gün</Text>
                </View>
              </Card>
            </View>

            {/* 4. HIZLI İŞLEMLER (QUICK ACTIONS) */}
            <View style={styles.quickActions}>
              <View style={styles.actionItem}>
                <IconButton icon="receipt" variant="solid" size={28} onPress={() => router.push('/expenses/new')} />
                <Text variant="caption" align="center" style={styles.actionLabel}>Harcama{'\n'}Ekle</Text>
              </View>
              <View style={styles.actionItem}>
                <IconButton icon="document-text" variant="solid" size={28} onPress={() => router.push('/bills/new')} />
                <Text variant="caption" align="center" style={styles.actionLabel}>Fatura{'\n'}Ekle</Text>
              </View>
              <View style={styles.actionItem}>
                <IconButton icon="cash" variant="solid" size={28} onPress={() => router.push('/debts')} />
                <Text variant="caption" align="center" style={styles.actionLabel}>Ödeme{'\n'}Yap</Text>
              </View>
              <View style={styles.actionItem}>
                <IconButton icon="person-add" variant="solid" size={28} onPress={() => router.push('/profile/group')} />
                <Text variant="caption" align="center" style={styles.actionLabel}>Üye{'\n'}Davet Et</Text>
              </View>
            </View>

            {/* 5. YAKLAŞAN FATURALAR (UPCOMING BILLS) */}
            <Section
              title="Yaklaşan Faturalar"
              action={<Text variant="caption" color={colors.primary} weight="bold" onPress={() => router.push('/bills')}>Tümünü Gör</Text>}
            >
              {upcomingBills.length === 0 ? (
                <Text variant="body" color={colors.text.secondary} align="center" style={styles.emptyListText}>
                  Yaklaşan bir faturan yok.
                </Text>
              ) : (
                <Card noPadding style={styles.listCard}>
                  {upcomingBills.map((bill, index) => (
                    <React.Fragment key={bill.id}>
                      <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/bills/${bill.id}`)} activeOpacity={0.7}>
                        <View style={[styles.listIconContainer, { backgroundColor: (EXPENSE_CATEGORY_COLORS[bill.category] ?? colors.text.secondary) + '20' }]}>
                          <Ionicons name={iconForBillCategory(bill.category)} size={20} color={EXPENSE_CATEGORY_COLORS[bill.category] ?? colors.text.secondary} />
                        </View>
                        <View style={styles.listContent}>
                          <Text variant="body" weight="semibold">{bill.title}</Text>
                          <Text variant="caption">Sorumlu: {bill.payerId === currentUserId ? 'Sen' : bill.payerName}</Text>
                        </View>
                        <View style={styles.listRight}>
                          <Text variant="body" weight="bold">{new Date(bill.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</Text>
                        </View>
                      </TouchableOpacity>
                      {index < upcomingBills.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </Card>
              )}
            </Section>

            {/* 6. SON HARCAMALAR (RECENT EXPENSES) */}
            <Section
              title="Son Harcamalar"
              action={<Text variant="caption" color={colors.primary} weight="bold" onPress={() => router.push('/expenses')}>Tümünü Gör</Text>}
            >
              {recentExpenses.length === 0 ? (
                <Text variant="body" color={colors.text.secondary} align="center" style={styles.emptyListText}>
                  Henüz bir harcama yok.
                </Text>
              ) : (
                <Card noPadding style={styles.listCard}>
                  {recentExpenses.map((expense, index) => (
                    <React.Fragment key={expense.id}>
                      <TouchableOpacity style={styles.listItem} onPress={() => router.push(`/expenses/${expense.id}`)} activeOpacity={0.7}>
                        <View style={[styles.listIconContainer, { backgroundColor: (EXPENSE_CATEGORY_COLORS[expense.category] ?? colors.text.secondary) + '20' }]}>
                          <Ionicons name={iconForCategory(expense.category)} size={20} color={EXPENSE_CATEGORY_COLORS[expense.category] ?? colors.text.secondary} />
                        </View>
                        <View style={styles.listContent}>
                          <Text variant="body" weight="semibold">{expense.title}</Text>
                          <Text variant="caption">{expense.payerId === currentUserId ? 'Sen ödedin' : `${expense.payerName} ödedi`}</Text>
                        </View>
                        <View style={styles.listRight}>
                          <Text variant="body" weight="bold">₺{expense.amount.toLocaleString('tr-TR')}</Text>
                          <Text variant="caption">{formatRelativeDate(expense.date)}</Text>
                        </View>
                      </TouchableOpacity>
                      {index < recentExpenses.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
                </Card>
              )}
            </Section>

            {/* 7. HARCAMA ÖZETİ (EXPENSE SUMMARY PREVIEW) */}
            {analytics && analytics.categories.length > 0 && (
              <Section
                title="Harcama Dağılımı"
                action={<Text variant="caption" color={colors.primary} weight="bold" onPress={() => router.push('/expenses/analytics')}>Detaylı Analiz</Text>}
              >
                <Card>
                  {analytics.categories.slice(0, 3).map((cat) => (
                    <View key={cat.name} style={styles.summaryRow}>
                      <Text variant="body" style={{ flex: 1 }}>{cat.name}</Text>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${cat.percentage}%`, backgroundColor: EXPENSE_CATEGORY_COLORS[cat.name] ?? colors.text.secondary }]} />
                      </View>
                      <Text variant="body" weight="bold" style={{ width: 40, textAlign: 'right' }}>%{cat.percentage}</Text>
                    </View>
                  ))}
                </Card>
              </Section>
            )}
          </>
        )}

      </ScrollView>

      {/* GRUP SEÇ MODALI */}
      <Modal visible={groupModalVisible} title="Grup Seç" onClose={() => setGroupModalVisible(false)}>
        <View style={{ gap: spacing.xs }}>
          {myGroups.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={styles.groupOption}
              onPress={() => {
                setSelectedGroupId(g.id);
                setGroupModalVisible(false);
              }}
            >
              <Text variant="body" weight={g.id === selectedGroupId ? 'bold' : 'medium'}>{g.name}</Text>
              {g.id === selectedGroupId && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
          <Button
            title="Grup Yönetimine Git"
            variant="outline"
            onPress={() => {
              setGroupModalVisible(false);
              router.push('/profile/group');
            }}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </Modal>

      {/* BİLDİRİMLER MODALI */}
      <Modal visible={notifModalVisible} title="Bildirimler" onClose={() => setNotifModalVisible(false)}>
        <ScrollView style={styles.notifScroll}>
          {notificationCount === 0 ? (
            <Text variant="body" color={colors.text.secondary} align="center">Henüz bir bildirimin yok.</Text>
          ) : (
            <>
              {notifications.upcoming.length > 0 && (
                <>
                  <Text variant="caption" weight="bold" color={colors.text.secondary} style={styles.notifSectionTitle}>YAKLAŞAN</Text>
                  {notifications.upcoming.map((n) => (
                    <View key={n.id} style={styles.notifRow}>
                      <Ionicons name="alert-circle" size={20} color={colors.danger} />
                      <View style={styles.notifTextContainer}>
                        <Text variant="body">{n.message}</Text>
                        <Text variant="caption" color={colors.text.secondary}>{n.groupName}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
              {notifications.recent.length > 0 && (
                <>
                  <Text variant="caption" weight="bold" color={colors.text.secondary} style={styles.notifSectionTitle}>SON ETKİNLİK</Text>
                  {notifications.recent.map((n) => (
                    <View key={n.id} style={styles.notifRow}>
                      <Ionicons name={n.type === 'expense_added' ? 'cart' : 'document-text'} size={20} color={colors.primary} />
                      <View style={styles.notifTextContainer}>
                        <Text variant="body">{n.message}</Text>
                        <Text variant="caption" color={colors.text.secondary}>{n.groupName} • {formatRelativeDate(n.createdAt)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </Modal>

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
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifButton: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  profileAvatar: {
    marginLeft: spacing.xs,
  },
  statusCard: {
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
    fontSize: 40,
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
    marginLeft: 40 + spacing.md * 2,
  },
  emptyListText: {
    paddingVertical: spacing.lg,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    marginTop: spacing.lg,
  },
  emptyDescription: {
    marginBottom: spacing.md,
  },
  groupOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  notifScroll: {
    maxHeight: 420,
  },
  notifSectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  notifTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
