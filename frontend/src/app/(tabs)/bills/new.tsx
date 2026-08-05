import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { BillForm, type BillFormCreateDefaults } from '../../../components';
import { createBill, type BillInput, type BillRecurrence } from '../../../services/bills';

export default function NewBillScreen() {
  const params = useLocalSearchParams<{
    groupId?: string;
    title?: string;
    category?: string;
    recurrence?: string;
    variableAmount?: string;
  }>();

  const createDefaults: BillFormCreateDefaults | undefined = params.groupId
    ? {
        groupId: params.groupId,
        title: params.title ?? '',
        category: params.category ?? '',
        recurrence: (params.recurrence as BillRecurrence) ?? 'monthly',
        variableAmount: params.variableAmount === 'true',
      }
    : undefined;

  const handleSubmit = async (input: BillInput) => {
    await createBill(input);
    router.back();
  };

  return (
    <BillForm
      mode="create"
      headerTitle="Yeni Fatura"
      submitLabel="Faturayı Kaydet"
      createDefaults={createDefaults}
      onSubmit={handleSubmit}
    />
  );
}
