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
import { ParticipantSplitPicker } from '../ParticipantSplitPicker';
import { colors, spacing, radius } from '../../theme';
import { ApiError } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import { getGroup, getMyGroups, type Group, type GroupMember } from '../../services/groups';
import {
  BILL_CATEGORIES,
  RECURRENCE_LABELS,
  REMINDER_LABELS,
  type BillInput,
  type BillRecurrence,
  type BillReminder,
} from '../../services/bills';
import { useParticipantSplit, type SplitMethod } from '../../hooks/useParticipantSplit';

export interface BillFormInitialValues {
  groupId: string;
  title: string;
  category: string;
  description: string;
  billDate: string;
  dueDate: string;
  amount: string;
  payerId: string;
  splitMethod: SplitMethod;
  recurrence: BillRecurrence;
  reminder: BillReminder;
  variableAmount: boolean;
  participants: { userId: string; shareAmount: number }[];
}

export interface BillFormCreateDefaults {
  groupId: string;
  title: string;
  category: string;
  recurrence: BillRecurrence;
  variableAmount: boolean;
}

interface BillFormProps {
  mode: 'create' | 'edit';
  initialValues?: BillFormInitialValues;
  createDefaults?: BillFormCreateDefaults;
  onSubmit: (input: BillInput) => Promise<void>;
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

function isoToDDMMYYYY(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

function ddmmyyyyToIso(text: string): string | null {
  const match = text.trim().match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function BillForm({ mode, initialValues, createDefaults, onSubmit, submitLabel, headerTitle }: BillFormProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState(initialValues?.groupId ?? createDefaults?.groupId ?? '');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(mode === 'create');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [title, setTitle] = useState(initialValues?.title ?? createDefaults?.title ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? createDefaults?.category ?? BILL_CATEGORIES[0]);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [amountText, setAmountText] = useState(initialValues?.amount ?? '');
  const [dueDateText, setDueDateText] = useState(
    initialValues?.dueDate ? isoToDDMMYYYY(initialValues.dueDate) : ''
  );
  const [payerId, setPayerId] = useState(initialValues?.payerId ?? '');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(initialValues?.splitMethod ?? 'equal');
  const [recurrence, setRecurrence] = useState<BillRecurrence>(initialValues?.recurrence ?? createDefaults?.recurrence ?? 'none');
  const [reminder, setReminder] = useState<BillReminder>(initialValues?.reminder ?? 'none');
  const [variableAmount] = useState<boolean>(initialValues?.variableAmount ?? createDefaults?.variableAmount ?? false);
  const billDate = initialValues?.billDate ?? todayIso();

  const initialParticipantValues = useMemo(() => {
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
  }, []);

  const {
    includedUserIds,
    toggleParticipant,
    setAllIncluded,
    participantValues,
    setParticipantValue,
    resetForSplitMethod,
    compute: computeParticipants,
  } = useParticipantSplit(
    initialValues?.participants.map((p) => p.userId) ?? [],
    initialParticipantValues
  );

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
        setAllIncluded(detail.members.map((m) => m.userId));
      }
    });
  }, [groupId]);

  useEffect(() => {
    if (mode === 'create' && !payerId && currentUserId) {
      setPayerId(currentUserId);
    }
  }, [currentUserId, mode, payerId]);

  const handleSplitMethodChange = (method: SplitMethod) => {
    setSplitMethod(method);
    resetForSplitMethod(method, amountText);
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
    const dueDateIso = ddmmyyyyToIso(dueDateText);
    if (!dueDateIso) {
      setErrorMessage('Son ödeme tarihini GG.AA.YYYY formatında gir (örn. 28.08.2026).');
      return;
    }
    if (!payerId) {
      setErrorMessage('Ödeyecek kişiyi seçmelisin.');
      return;
    }

    const result = computeParticipants(splitMethod, amountText);
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
        billDate,
        dueDate: dueDateIso,
        payerId,
        splitMethod,
        recurrence,
        reminder,
        variableAmount,
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
            Fatura ekleyebilmek için bir grup oluşturman veya bir gruba katılman gerekiyor.
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

        {mode === 'create' && !createDefaults && myGroups.length > 1 && (
          <View style={styles.section}>
            <Text variant="body" weight="bold" style={styles.sectionTitle}>Grup</Text>
            <View style={styles.chipsRow}>
              {myGroups.map((g) => (
                <Chip key={g.id} label={g.name} active={groupId === g.id} onPress={() => setGroupId(g.id)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Temel Bilgiler</Text>
          <Input label="Fatura Adı" placeholder="Örn: Elektrik, İnternet" value={title} onChangeText={setTitle} />

          <Text variant="body" weight="medium" style={styles.subTitle}>Kategori</Text>
          <View style={styles.chipsRow}>
            {BILL_CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Finansal Bilgiler</Text>
          {variableAmount && (
            <Text variant="caption" color={colors.text.secondary} style={{ marginBottom: spacing.sm }}>
              Bu faturanın tutarı aydan aya değişir, her ay bu ekrandan güncel tutarı gireceksin.
            </Text>
          )}
          <CurrencyInput label="Tutar" value={amountText} onChangeText={setAmountText} />

          <View style={styles.dateSelectorRow}>
            <View style={styles.dateSelector}>
              <Text variant="caption" color={colors.text.secondary}>Fatura Tarihi</Text>
              <View style={styles.dateInner}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text variant="body" style={{ marginLeft: spacing.xs }}>{formatDateLabel(billDate)}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Son Ödeme (GG.AA.YYYY)"
                placeholder="28.08.2026"
                value={dueDateText}
                onChangeText={setDueDateText}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Tekrarlama</Text>
          <View style={styles.chipsRow}>
            {(Object.keys(RECURRENCE_LABELS) as BillRecurrence[]).map((r) => (
              <Chip key={r} label={RECURRENCE_LABELS[r]} active={recurrence === r} onPress={() => setRecurrence(r)} />
            ))}
          </View>
        </View>

        {isLoadingMembers ? (
          <Loading />
        ) : (
          <>
            <View style={styles.section}>
              <Text variant="body" weight="bold" style={styles.sectionTitle}>Kişiler</Text>
              <Text variant="body" weight="medium" style={styles.subTitle}>Ödeyecek Kişi (Sorumlu)</Text>
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

              <View style={{ marginTop: spacing.md }}>
                <ParticipantSplitPicker
                  members={members}
                  currentUserId={currentUserId}
                  splitMethod={splitMethod}
                  onSplitMethodChange={handleSplitMethodChange}
                  includedUserIds={includedUserIds}
                  onToggleParticipant={toggleParticipant}
                  participantValues={participantValues}
                  onParticipantValueChange={setParticipantValue}
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Ek Detaylar</Text>
          <Text variant="body" weight="medium" style={styles.subTitle}>Hatırlatma</Text>
          <View style={styles.chipsRow}>
            {(Object.keys(REMINDER_LABELS) as BillReminder[]).map((r) => (
              <Chip key={r} label={REMINDER_LABELS[r]} active={reminder === r} onPress={() => setReminder(r)} />
            ))}
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Input
              label="Not (İsteğe bağlı)"
              placeholder="Faturayla ilgili serbest notunuz..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
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
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: 18,
    color: colors.primary,
  },
  subTitle: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  dateSelector: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
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
