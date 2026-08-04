import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Input, CurrencyInput, Chip, Modal, Loading } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import { getGroup, getMyGroups, type Group, type GroupMember } from '../../../services/groups';
import { SETTLEMENT_METHOD_LABELS, settleDebt, type SettlementMethod } from '../../../services/debts';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function GeneralSettleScreen() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myInitials, setMyInitials] = useState('SE');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState('');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [otherUserId, setOtherUserId] = useState('');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [iPaid, setIPaid] = useState(true);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<SettlementMethod>('cash');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    Promise.all([getCurrentUser(), getMyGroups()]).then(([user, groups]) => {
      if (user) {
        setCurrentUserId(user.id);
        setMyInitials(initialsOf(user.name));
      }
      setMyGroups(groups);
      setIsLoadingGroups(false);
      if (groups.length > 0) setGroupId(groups[0].id);
    });
  }, []);

  useEffect(() => {
    if (!groupId) return;
    setIsLoadingMembers(true);
    setOtherUserId('');
    getGroup(groupId).then((detail) => {
      setMembers(detail.members.filter((m) => m.userId !== currentUserId));
      setIsLoadingMembers(false);
    });
  }, [groupId, currentUserId]);

  const selectedPerson = members.find((m) => m.userId === otherUserId);

  const handleConfirm = async () => {
    setConfirmModalVisible(false);
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      await settleDebt({
        otherUserId,
        amount: parseFloat(amount.replace(',', '.')),
        direction: iPaid ? 'i_paid' : 'they_paid',
        method,
        note: note || null,
      });
      router.replace('/debts');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text variant="h2" align="center" style={styles.emptyTitle}>Önce bir grubun olmalı</Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.emptyDescription}>
            Hesap dengeleyebilmek için bir grup oluşturman veya bir gruba katılman gerekiyor.
          </Text>
          <Button title="Grup Yönetimine Git" onPress={() => router.replace('/profile/group')} />
        </View>
      </Screen>
    );
  }

  const payerLabel = iPaid ? 'Sen' : selectedPerson?.name ?? 'Karşı Taraf';
  const receiverLabel = iPaid ? selectedPerson?.name ?? 'Karşı Taraf' : 'Sen';
  const payerInitials = iPaid ? myInitials : selectedPerson ? initialsOf(selectedPerson.name) : '?';
  const receiverInitials = iPaid ? (selectedPerson ? initialsOf(selectedPerson.name) : '?') : myInitials;

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Hesap Dengele</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {myGroups.length > 1 && (
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
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>Kiminle Hesaplaşacaksın?</Text>
          {isLoadingMembers ? (
            <Loading />
          ) : members.length === 0 ? (
            <Text variant="body" color={colors.text.secondary}>Bu grupta başka üye yok.</Text>
          ) : (
            <View style={styles.chipsRow}>
              {members.map((m) => (
                <Chip key={m.userId} label={m.name} active={otherUserId === m.userId} onPress={() => setOtherUserId(m.userId)} />
              ))}
            </View>
          )}
        </View>

        {otherUserId && (
          <>
            <Card style={styles.transferCard}>
              <View style={styles.transferRow}>
                <View style={styles.transferPerson}>
                  <Avatar initials={payerInitials} size={48} />
                  <Text variant="body" weight="semibold" style={{ marginTop: spacing.xs }}>{payerLabel}</Text>
                  <Text variant="caption" color={colors.text.secondary}>Ödeyen</Text>
                </View>
                <View style={styles.transferArrow}>
                  <View style={styles.dashedLine} />
                  <Ionicons name="arrow-forward-circle" size={28} color={colors.primary} style={styles.arrowIcon} />
                  <View style={styles.dashedLine} />
                </View>
                <View style={styles.transferPerson}>
                  <Avatar initials={receiverInitials} size={48} />
                  <Text variant="body" weight="semibold" style={{ marginTop: spacing.xs }}>{receiverLabel}</Text>
                  <Text variant="caption" color={colors.text.secondary}>Alıcı</Text>
                </View>
              </View>
            </Card>

            <View style={styles.section}>
              <Text variant="body" weight="semibold" style={styles.sectionTitle}>Kim Ödedi?</Text>
              <View style={styles.chipsRow}>
                <Chip label="Sen Ödedin" active={iPaid} onPress={() => setIPaid(true)} />
                <Chip label={`${selectedPerson?.name ?? 'Karşı Taraf'} Ödedi`} active={!iPaid} onPress={() => setIPaid(false)} />
              </View>
            </View>

            <View style={styles.formSection}>
              <CurrencyInput label="Ödenen Tutar" value={amount} onChangeText={setAmount} />

              <Text variant="body" weight="medium" style={styles.subTitle}>Ödeme Yöntemi</Text>
              <View style={styles.chipsRow}>
                {(Object.keys(SETTLEMENT_METHOD_LABELS) as SettlementMethod[]).map((m) => (
                  <Chip key={m} label={SETTLEMENT_METHOD_LABELS[m]} active={method === m} onPress={() => setMethod(m)} />
                ))}
              </View>

              <Input
                label="Not (Opsiyonel)"
                placeholder="Örn: Uygulama dışında nakit ödendi"
                value={note}
                onChangeText={setNote}
              />

              {errorMessage && (
                <Text variant="caption" color={colors.danger}>{errorMessage}</Text>
              )}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ALT BUTON */}
      <View style={styles.bottomBar}>
        <Button
          title="Kaydet"
          onPress={() => setConfirmModalVisible(true)}
          disabled={!otherUserId || !amount}
        />
      </View>

      {/* ONAY MODALI */}
      <Modal
        visible={confirmModalVisible}
        title="Hesaplaşma Onayı"
        onClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text variant="body" align="center" style={{ marginBottom: spacing.xl, fontSize: 16 }}>
            {payerLabel}'dan {receiverLabel}'e <Text weight="bold" color={colors.primary}>₺{amount}</Text> ödeme kaydedilsin mi?
          </Text>
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              variant="outline"
              onPress={() => setConfirmModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Onayla"
              onPress={handleConfirm}
              isLoading={isSubmitting}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>

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
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  transferCard: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transferPerson: {
    alignItems: 'center',
    flex: 1,
  },
  transferArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  arrowIcon: {
    marginHorizontal: spacing.xs,
  },
  formSection: {
    gap: spacing.md,
  },
  subTitle: {
    marginBottom: -spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xxl,
  },
  modalContent: {
    paddingTop: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
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
