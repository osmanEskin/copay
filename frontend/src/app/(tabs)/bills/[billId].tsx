import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, Button, Avatar, Divider, Section, Badge, Loading } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { confirmAsync } from '../../../utils/confirm';
import { deleteBill, getBill, iconForBillCategory, markBillPaid, type BillDetail } from '../../../services/bills';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function BillDetailScreen() {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      setLoadError(undefined);
      getBill(billId)
        .then((detail) => {
          if (active) setBill(detail);
        })
        .catch(() => {
          if (active) setLoadError('Fatura yüklenemedi.');
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => {
        active = false;
      };
    }, [billId])
  );

  const handleMarkPaid = async () => {
    setIsMarkingPaid(true);
    try {
      const updated = await markBillPaid(billId);
      setBill((prev) => (prev ? { ...prev, ...updated } : prev));
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmAsync(
      'Faturayı Sil',
      'Bu faturayı tamamen silmek istediğinize emin misiniz?',
      'Sil'
    );
    if (!confirmed) return;

    await deleteBill(billId);
    router.back();
  };

  if (isLoading) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  if (loadError || !bill) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.danger} align="center">{loadError ?? 'Fatura bulunamadı.'}</Text>
          <Button title="Geri Dön" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
        </View>
      </Screen>
    );
  }

  const isPaid = bill.status === 'Ödendi';
  const needsAmount = bill.variableAmount && bill.amount === 0;

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Fatura Detayı</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push(`/bills/${billId}/edit`)}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ANA BİLGİ KARTI */}
        <Card style={styles.mainCard}>
          <View style={[styles.iconCircle, { backgroundColor: isPaid ? colors.success + '15' : colors.primary + '15' }]}>
            <Ionicons name={iconForBillCategory(bill.category)} size={32} color={isPaid ? colors.success : colors.primary} />
          </View>
          <Text variant="h1" align="center" style={styles.title}>{bill.title}</Text>
          {needsAmount ? (
            <Text variant="h1" color={colors.danger} align="center" style={styles.amount}>
              Tutar Girilmedi
            </Text>
          ) : (
            <Text variant="h1" color={isPaid ? colors.success : colors.primary} align="center" style={styles.amount}>
              ₺{bill.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Text>
          )}

          <Badge
            label={needsAmount ? 'Tutar Bekleniyor' : bill.status}
            variant={needsAmount ? 'danger' : isPaid ? 'success' : 'default'}
            style={{ marginBottom: spacing.md }}
          />

          <View style={styles.infoRowContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.text.secondary} />
              <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
                Son Ödeme: {new Date(bill.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {bill.description && (
            <View style={styles.descriptionBox}>
              <Text variant="body" color={colors.text.secondary} align="center">
                "{bill.description}"
              </Text>
            </View>
          )}
        </Card>

        {/* SORUMLU KİŞİ */}
        <Section title="Sorumlu Kişi">
          <Card style={styles.payerCard}>
            <Avatar initials={initialsOf(bill.payerName)} size={40} />
            <View style={styles.payerInfo}>
              <Text variant="body" weight="semibold">{bill.payerName}</Text>
              <Text variant="caption" color={colors.text.secondary}>Ödemeyi yapacak olan kişi</Text>
            </View>
          </Card>
        </Section>

        {/* KATILIMCILAR */}
        <Section title="Katılımcılar">
          <Card noPadding style={styles.participantsCard}>
            {bill.participants.map((p, index) => (
              <React.Fragment key={p.userId}>
                <View style={styles.participantRow}>
                  <Avatar initials={initialsOf(p.name)} size={36} />
                  <Text variant="body" style={styles.participantName}>{p.name}</Text>
                  <Text variant="body" weight="semibold">
                    ₺{p.shareAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                {index < bill.participants.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Section>

        {/* ÖDEME DURUMU KARTI */}
        <Section title="Ödeme Durumu">
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text variant="body" weight="semibold">Ödendi mi?</Text>
              <Text variant="body" color={isPaid ? colors.success : colors.danger} weight="bold">
                {isPaid ? 'Evet' : 'Hayır'}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              {!isPaid && needsAmount && (
                <Button
                  title="Bu Ayın Tutarını Gir"
                  onPress={() => router.push(`/bills/${billId}/edit`)}
                  style={styles.actionBtn}
                />
              )}
              {!isPaid && !needsAmount && (
                <Button
                  title="Ödendi Olarak İşaretle"
                  onPress={handleMarkPaid}
                  isLoading={isMarkingPaid}
                  style={styles.actionBtn}
                />
              )}
              <Button
                title="Faturayı Sil"
                variant="outline"
                onPress={handleDelete}
                style={styles.actionBtn}
              />
            </View>
          </Card>
        </Section>

        <View style={{ height: spacing.xxl }} />
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  infoRowContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
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
  },
  statusCard: {
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionBtn: {
    width: '100%',
  }
});
