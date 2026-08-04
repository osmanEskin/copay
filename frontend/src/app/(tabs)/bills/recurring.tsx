import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, Button, Divider, Modal, Loading } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { confirmAsync } from '../../../utils/confirm';
import {
  RECURRENCE_LABELS,
  deleteBill,
  getBill,
  getRecurringBills,
  iconForBillCategory,
  updateBill,
  type BillSummary,
} from '../../../services/bills';

export default function RecurringBillsScreen() {
  const [bills, setBills] = useState<BillSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<BillSummary | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const loadRecurring = useCallback(() => {
    setIsLoading(true);
    getRecurringBills().then((list) => {
      setBills(list);
      setIsLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecurring();
    }, [loadRecurring])
  );

  const handleAction = (bill: BillSummary) => {
    setSelectedBill(bill);
    setActionModalVisible(true);
  };

  const handleEdit = () => {
    if (!selectedBill) return;
    setActionModalVisible(false);
    router.push(`/bills/${selectedBill.id}/edit`);
  };

  const handleSetInactive = async () => {
    if (!selectedBill) return;
    setActionModalVisible(false);
    const detail = await getBill(selectedBill.id);
    await updateBill(selectedBill.id, {
      groupId: detail.groupId,
      title: detail.title,
      category: detail.category,
      description: detail.description,
      amount: detail.amount,
      billDate: detail.billDate,
      dueDate: detail.dueDate,
      payerId: detail.payerId,
      splitMethod: detail.splitMethod,
      recurrence: 'none',
      reminder: detail.reminder,
      participants: detail.participants.map((p) => ({ userId: p.userId, shareAmount: p.shareAmount })),
    });
    loadRecurring();
  };

  const handleRemove = async () => {
    if (!selectedBill) return;
    setActionModalVisible(false);
    const confirmed = await confirmAsync(
      'Tekrarlayan Faturayı Sil',
      `${selectedBill.title} kalıcı olarak silinecek. Emin misiniz?`,
      'Sil'
    );
    if (!confirmed) return;
    await deleteBill(selectedBill.id);
    loadRecurring();
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Otomatik Faturalar</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text variant="caption" color={colors.primary} style={{ marginLeft: spacing.sm, flex: 1 }}>
          Tekrarlama sıklığı belirlenmiş, henüz ödenmemiş faturalar.
        </Text>
      </View>

      {/* LISTE */}
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {bills.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.text.secondary} align="center">
                Henüz tekrarlayan bir faturan yok.
              </Text>
            </View>
          ) : (
            bills.map((bill) => (
              <Card key={bill.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={iconForBillCategory(bill.category)} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.titleSection}>
                    <Text variant="body" weight="semibold">{bill.title}</Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      {RECURRENCE_LABELS[bill.recurrence]} • Son ödeme: {new Date(bill.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.amountSection}>
                    <Text variant="body" weight="bold">₺{bill.amount.toLocaleString('tr-TR')}</Text>
                    <Text variant="caption" color={colors.text.secondary}>{bill.status}</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: spacing.md }} />

                <View style={styles.cardBottom}>
                  <Button
                    title="Yönet"
                    variant="secondary"
                    onPress={() => handleAction(bill)}
                    style={styles.actionBtn}
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* YÖNET MODALI */}
      <Modal
        visible={actionModalVisible}
        title={selectedBill ? `${selectedBill.title} Ayarları` : ''}
        onClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={handleSetInactive}>
            <Ionicons name="pause-circle-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Tekrarlamayı Durdur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
            <Text variant="body" weight="medium" color={colors.danger} style={styles.modalOptionText}>Sil</Text>
          </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    gap: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  modalOptionText: {
    marginLeft: spacing.md,
  },
});
