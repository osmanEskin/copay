import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, Button, Avatar, Divider, Section, Loading } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { confirmAsync } from '../../../utils/confirm';
import { getCurrentUser } from '../../../services/auth';
import { deleteExpense, getExpense, iconForCategory, type ExpenseDetail } from '../../../services/expenses';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const SPLIT_METHOD_LABELS: Record<string, string> = {
  equal: 'Eşit',
  percentage: 'Yüzdelik',
  amount: 'Tutar',
};

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      setLoadError(undefined);
      Promise.all([getCurrentUser(), getExpense(expenseId)])
        .then(([user, detail]) => {
          if (!active) return;
          setCurrentUserId(user?.id ?? null);
          setExpense(detail);
        })
        .catch(() => {
          if (active) setLoadError('Harcama yüklenemedi.');
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => {
        active = false;
      };
    }, [expenseId])
  );

  const handleDelete = async () => {
    const confirmed = await confirmAsync(
      'Harcamayı Sil',
      'Bu harcamayı silmek istediğinize emin misiniz?',
      'Sil'
    );
    if (!confirmed) return;

    await deleteExpense(expenseId);
    router.back();
  };

  if (isLoading) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  if (loadError || !expense) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.danger} align="center">{loadError ?? 'Harcama bulunamadı.'}</Text>
          <Button title="Geri Dön" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Harcama Detayı</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push(`/expenses/${expenseId}/edit`)}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ANA KART */}
        <Card style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconForCategory(expense.category)} size={32} color={colors.primary} />
          </View>
          <Text variant="h1" align="center" style={styles.title}>{expense.title}</Text>
          <Text variant="h1" color={colors.primary} align="center" style={styles.amount}>
            ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
              {new Date(expense.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <Text variant="caption" color={colors.text.secondary}> • </Text>
            <Ionicons name="pricetag-outline" size={16} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>{expense.category}</Text>
          </View>

          {expense.description && (
            <View style={styles.descriptionBox}>
              <Text variant="body" color={colors.text.secondary} align="center">
                "{expense.description}"
              </Text>
            </View>
          )}
        </Card>

        {/* ÖDEYEN */}
        <Section title="Kim Ödedi?">
          <Card style={styles.payerCard}>
            <Avatar initials={initialsOf(expense.payerName)} size={40} />
            <View style={styles.payerInfo}>
              <Text variant="body" weight="semibold">
                {expense.payerId === currentUserId ? 'Sen' : expense.payerName}
              </Text>
              <Text variant="caption" color={colors.text.secondary}>Tüm tutarı ödedi</Text>
            </View>
            <Text variant="body" weight="bold" color={colors.primary}>
              ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Text>
          </Card>
        </Section>

        {/* KATILIMCILAR */}
        <Section title={`Nasıl Bölüşüldü? (${SPLIT_METHOD_LABELS[expense.splitMethod] ?? expense.splitMethod})`}>
          <Card noPadding style={styles.participantsCard}>
            {expense.participants.map((p, index) => (
              <React.Fragment key={p.userId}>
                <View style={styles.participantRow}>
                  <Avatar initials={initialsOf(p.name)} size={36} />
                  <Text variant="body" style={styles.participantName}>
                    {p.userId === currentUserId ? 'Sen' : p.name}
                  </Text>
                  <Text variant="body" weight="semibold">
                    ₺{p.shareAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                {index < expense.participants.length - 1 && <Divider />}
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
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    marginLeft: 4,
    marginRight: 8,
  },
  descriptionBox: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  payerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  participantsCard: {
    overflow: 'hidden',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  participantName: {
    flex: 1,
    marginLeft: spacing.md,
  }
});
