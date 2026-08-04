import React from 'react';
import { router } from 'expo-router';
import { BillForm } from '../../../components';
import { createBill, type BillInput } from '../../../services/bills';

export default function NewBillScreen() {
  const handleSubmit = async (input: BillInput) => {
    await createBill(input);
    router.back();
  };

  return (
    <BillForm
      mode="create"
      headerTitle="Yeni Fatura"
      submitLabel="Faturayı Kaydet"
      onSubmit={handleSubmit}
    />
  );
}
