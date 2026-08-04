import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Input, CurrencyInput, Chip, Modal, Loading } from '../../../../components';
import { colors, spacing, radius } from '../../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../../services/api';
import { getCurrentUser } from '../../../../services/auth';
import {
  SETTLEMENT_METHOD_LABELS,
  getPersonDebt,
  settleDebt,
  type SettlementMethod,
} from '../../../../services/debts';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SettleDebtScreen() {
  const { personId } = useLocalSearchParams<{ personId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [myInitials, setMyInitials] = useState('SE');
  const [personName, setPersonName] = useState('');
  const [iOwe, setIOwe] = useState(true);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState<SettlementMethod>('cash');

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    Promise.all([getCurrentUser(), getPersonDebt(personId)]).then(([user, detail]) => {
      if (user) setMyInitials(initialsOf(user.name));
      setPersonName(detail.personName);
      setIOwe(detail.type !== 'owe_me');
      setAmount(detail.amount > 0 ? String(detail.amount) : '');
      setIsLoading(false);
    });
  }, [personId]);

  const handleConfirm = async () => {
    setConfirmModalVisible(false);
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      await settleDebt({
        otherUserId: personId,
        amount: parseFloat(amount.replace(',', '.')),
        direction: iOwe ? 'i_paid' : 'they_paid',
        method,
        note: note || null,
      });
      router.dismissAll();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  const paymentMethods = Object.keys(SETTLEMENT_METHOD_LABELS) as SettlementMethod[];
  const payerLabel = iOwe ? 'Sen' : personName;
  const receiverLabel = iOwe ? personName : 'Sen';
  const payerInitials = iOwe ? myInitials : initialsOf(personName);
  const receiverInitials = iOwe ? initialsOf(personName) : myInitials;

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Hesaplaş</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* HESAPLAŞMA KARTI (Ödeyen -> Alan) */}
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

        {/* FORM */}
        <View style={styles.formSection}>
          <CurrencyInput
            label="Ödenecek Tutar"
            value={amount}
            onChangeText={setAmount}
          />

          <Text variant="body" weight="medium" style={styles.subTitle}>Ödeme Yöntemi</Text>
          <View style={styles.chipsRow}>
            {paymentMethods.map(m => (
              <Chip
                key={m}
                label={SETTLEMENT_METHOD_LABELS[m]}
                active={method === m}
                onPress={() => setMethod(m)}
              />
            ))}
          </View>

          <Input
            label="Not (Opsiyonel)"
            placeholder="Örn: Temmuz ayı elektrik borcu"
            value={note}
            onChangeText={setNote}
          />

          {errorMessage && (
            <Text variant="caption" color={colors.danger}>{errorMessage}</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ALT BUTON */}
      <View style={styles.bottomBar}>
        <Button
          title="Kaydet"
          onPress={() => setConfirmModalVisible(true)}
          disabled={!amount}
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
            {receiverLabel}'e <Text weight="bold" color={colors.primary}>₺{amount}</Text> ödeme kaydedilsin mi?
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  }
});
