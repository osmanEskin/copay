import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { BillForm, Screen, Loading } from '../../../../components';
import { colors } from '../../../../theme';
import { getBill, updateBill, type BillInput } from '../../../../services/bills';
import type { BillFormInitialValues } from '../../../../components/BillForm';

export default function EditBillScreen() {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  const [initialValues, setInitialValues] = useState<BillFormInitialValues | null>(null);

  useEffect(() => {
    getBill(billId).then((bill) => {
      setInitialValues({
        groupId: bill.groupId,
        title: bill.title,
        category: bill.category,
        description: bill.description ?? '',
        billDate: bill.billDate,
        dueDate: bill.dueDate,
        amount: String(bill.amount),
        payerId: bill.payerId,
        splitMethod: bill.splitMethod,
        recurrence: bill.recurrence,
        reminder: bill.reminder,
        participants: bill.participants.map((p) => ({ userId: p.userId, shareAmount: p.shareAmount })),
      });
    });
  }, [billId]);

  const handleSubmit = async (input: BillInput) => {
    await updateBill(billId, input);
    router.back();
  };

  if (!initialValues) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  return (
    <BillForm
      mode="edit"
      headerTitle="Faturayı Düzenle"
      submitLabel="Değişiklikleri Kaydet"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
