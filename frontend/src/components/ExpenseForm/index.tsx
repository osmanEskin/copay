import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../Screen';
import { Text } from '../Text';
import { Input } from '../Input';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { CurrencyInput } from '../CurrencyInput';
import { Loading } from '../Loading';
import { colors, spacing, radius } from '../../theme';
import { ApiError } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import { getGroup, getMyGroups, type Group, type GroupMember } from '../../services/groups';
import { EXPENSE_CATEGORIES, type ExpenseInput, type SplitMethod } from '../../services/expenses';

export interface ExpenseFormInitialValues {
  groupId: string;
  title: string;
  category: string;
  description: string;
  date: string;
  amount: string;
  payerId: string;
  splitMethod: SplitMethod;
  participants: { userId: string; shareAmount: number }[];
}

interface ExpenseFormProps {
  mode: 'create' | 'edit';
  initialValues?: ExpenseFormInitialValues;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  submitLabel: string;
  headerTitle: string;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const SPLIT_METHOD_LABELS: Record<SplitMethod, string> = {
  equal: 'Eşit',
  percentage: 'Yüzdelik',
  amount: 'Tutar',
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ExpenseForm({ mode, initialValues, onSubmit, submitLabel, headerTitle }: ExpenseFormProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState(initialValues?.groupId ?? '');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(mode === 'create');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [amountText, setAmountText] = useState(initialValues?.amount ?? '');
  const [payerId, setPayerId] = useState(initialValues?.payerId ?? '');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(initialValues?.splitMethod ?? 'equal');
  const date = initialValues?.date ?? todayIso();

  const [includedUserIds, setIncludedUserIds] = useState<Set<string>>(
    new Set(initialValues?.participants.map((p) => p.userId) ?? [])
  );
  const [participantValues, setParticipantValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    if (initialValues) {
      const amountNum = Number(initialValues.amount) || 0;
      for (const p of initialValues.participants) {
        values[p.userId] =
          initialValues.splitMethod === 'percentage'
            ? String(amountNum ? Math.round((p.shareAmount / amountNum) * 100) : 0)
            : String(p.shareAmount);
      }
    }
    return values;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    getCurrentUser().then((user) => setCurrentUserId(user?.id ?? null));
  }, []);

  useEffect(() => {
    if (mode !== 'create') return;
    getMyGroups().then((groups) => {
      setMyGroups(groups);
      setIsLoadingGroups(false);
      if (groups.length > 0 && !groupId) {
        setGroupId(groups[0].id);
      }
    });
  }, [mode]);

  useEffect(() => {
    if (!groupId) {
      setIsLoadingMembers(false);
      return;
    }
    setIsLoadingMembers(true);
    getGroup(groupId).then((detail) => {
      setMembers(detail.members);
      setIsLoadingMembers(false);
      if (mode === 'create') {
        setIncludedUserIds(new Set(detail.members.map((m) => m.userId)));
      }
    });
  }, [groupId]);

  useEffect(() => {
    if (mode === 'create' && !payerId && currentUserId) {
      setPayerId(currentUserId);
    }
  }, [currentUserId, mode, payerId]);

  const toggleParticipant = (userId: string) => {
    setIncludedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSplitMethodChange = (method: SplitMethod) => {
    setSplitMethod(method);
    if (method === 'equal') return;
    const ids = [...includedUserIds];
    if (ids.length === 0) return;
    const amountNum = parseFloat(amountText.replace(',', '.')) || 0;
    const next: Record<string, string> = {};
    if (method === 'percentage') {
      const share = Math.floor(100 / ids.length);
      ids.forEach((id, i) => {
        next[id] = String(i === ids.length - 1 ? 100 - share * (ids.length - 1) : share);
      });
    } else {
      const share = Math.floor((amountNum / ids.length) * 100) / 100;
      ids.forEach((id, i) => {
        next[id] = i === ids.length - 1 ? (amountNum - share * (ids.length - 1)).toFixed(2) : share.toFixed(2);
      });
    }
    setParticipantValues(next);
  };

  const computeParticipants = (): { participants: { userId: string; shareAmount: number }[] } | { error: string } => {
    const ids = [...includedUserIds];
    if (ids.length === 0) {
      return { error: 'En az bir katılımcı seçmelisin.' };
    }
    const amountNum = parseFloat(amountText.replace(',', '.'));
    if (!amountNum || amountNum <= 0) {
      return { error: 'Geçerli bir tutar girin.' };
    }

    if (splitMethod === 'equal') {
      const base = Math.floor((amountNum / ids.length) * 100) / 100;
      const shares = ids.map(() => base);
      const remainder = Math.round((amountNum - base * ids.length) * 100) / 100;
      shares[shares.length - 1] = Math.round((shares[shares.length - 1] + remainder) * 100) / 100;
      return { participants: ids.map((userId, i) => ({ userId, shareAmount: shares[i] })) };
    }

    if (splitMethod === 'percentage') {
      const percents = ids.map((id) => parseFloat((participantValues[id] ?? '0').replace(',', '.')) || 0);
      const sum = percents.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.5) {
        return { error: `Yüzdelerin toplamı 100 olmalı (şu an %${sum}).` };
      }
      const shares = percents.map((p) => Math.round(amountNum * p) / 100);
      const remainder = Math.round((amountNum - shares.reduce((a, b) => a + b, 0)) * 100) / 100;
      shares[shares.length - 1] = Math.round((shares[shares.length - 1] + remainder) * 100) / 100;
      return { participants: ids.map((userId, i) => ({ userId, shareAmount: shares[i] })) };
    }

    const amounts = ids.map((id) => parseFloat((participantValues[id] ?? '0').replace(',', '.')) || 0);
    const sum = Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100;
    if (Math.abs(sum - amountNum) > 0.5) {
      return { error: `Girilen tutarların toplamı ${amountNum} olmalı (şu an ${sum}).` };
    }
    return { participants: ids.map((userId, i) => ({ userId, shareAmount: amounts[i] })) };
  };

  const handleSave = async () => {
    setErrorMessage(undefined);

    if (!groupId) {
      setErrorMessage('Bir grup seçmelisin.');
      return;
    }
    const amountNum = parseFloat(amountText.replace(',', '.'));
    if (!title || !amountNum || amountNum <= 0) {
      setErrorMessage('Başlık ve geçerli bir tutar gerekli.');
      return;
    }
    if (!payerId) {
      setErrorMessage('Ödeyen kişiyi seçmelisin.');
      return;
    }

    const result = computeParticipants();
    if ('error' in result) {
      setErrorMessage(result.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        groupId,
        title,
        category,
        description: description || null,
        amount: amountNum,
        date,
        payerId,
        splitMethod,
        participants: result.participants,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGroup = useMemo(
    () => myGroups.find((g) => g.id === groupId),
    [myGroups, groupId]
  );

  if (mode === 'create' && isLoadingGroups) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  if (mode === 'create' && myGroups.length === 0) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.text.secondary} />
          <Text variant="h2" align="center" style={styles.emptyTitle}>Önce bir grubun olmalı</Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.emptyDescription}>
            Harcama ekleyebilmek için bir grup oluşturman veya bir gruba katılman gerekiyor.
          </Text>
          <Button title="Grup Yönetimine Git" onPress={() => router.replace('/profile/group')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea backgroundColor={colors.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>{headerTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {mode === 'create' && myGroups.length > 1 && (
          <View style={styles.section}>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>Grup</Text>
            <View style={styles.chipsRow}>
              {myGroups.map((g) => (
                <Chip key={g.id} label={g.name} active={groupId === g.id} onPress={() => setGroupId(g.id)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Input label="Başlık" placeholder="Ne için harcadınız?" value={title} onChangeText={setTitle} />

          <CurrencyInput label="Tutar" value={amountText} onChangeText={setAmountText} />

          <View style={styles.dateSelector}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text variant="body" style={{ marginLeft: spacing.sm }}>{formatDateLabel(date)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>Kategori</Text>
          <View style={styles.chipsRow}>
            {EXPENSE_CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        {isLoadingMembers ? (
          <Loading />
        ) : (
          <>
            <View style={styles.section}>
              <Text variant="body" weight="semibold" style={styles.sectionTitle}>Kim Ödedi?</Text>
              <View style={styles.chipsRow}>
                {members.map((m) => (
                  <Chip
                    key={m.userId}
                    label={m.userId === currentUserId ? 'Sen' : m.name}
                    active={payerId === m.userId}
                    onPress={() => setPayerId(m.userId)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="body" weight="semibold" style={styles.sectionTitle}>Nasıl Bölüşülecek?</Text>
              <View style={styles.chipsRow}>
                {(Object.keys(SPLIT_METHOD_LABELS) as SplitMethod[]).map((m) => (
                  <Chip
                    key={m}
                    label={SPLIT_METHOD_LABELS[m]}
                    active={splitMethod === m}
                    onPress={() => handleSplitMethodChange(m)}
                  />
                ))}
              </View>

              <View style={styles.participantsContainer}>
                {members.map((m) => {
                  const included = includedUserIds.has(m.userId);
                  return (
                    <View key={m.userId} style={styles.participantRow}>
                      <TouchableOpacity
                        style={styles.participantCheckRow}
                        onPress={() => toggleParticipant(m.userId)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={included ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={included ? colors.primary : colors.text.secondary}
                        />
                        <Text variant="body" style={styles.participantName}>
                          {m.userId === currentUserId ? 'Sen' : m.name}
                        </Text>
                      </TouchableOpacity>
                      {included && splitMethod !== 'equal' && (
                        <Input
                          value={participantValues[m.userId] ?? ''}
                          onChangeText={(text) =>
                            setParticipantValues((prev) => ({ ...prev, [m.userId]: text }))
                          }
                          keyboardType="decimal-pad"
                          style={styles.participantValueInput}
                          placeholder={splitMethod === 'percentage' ? '%' : '₺'}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Input
            label="Açıklama (İsteğe bağlı)"
            placeholder="Harcama ile ilgili notlar..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {errorMessage && (
          <Text variant="caption" color={colors.danger} style={{ marginBottom: spacing.md }}>
            {errorMessage}
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={submitLabel}
          onPress={handleSave}
          isLoading={isSubmitting}
          disabled={!title || !amountText}
        />
      </View>
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
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  participantsContainer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    marginLeft: spacing.sm,
  },
  participantValueInput: {
    width: 70,
    marginBottom: 0,
    textAlign: 'right',
  },
  bottomBar: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
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
});
