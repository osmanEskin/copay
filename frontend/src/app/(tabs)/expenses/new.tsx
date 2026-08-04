import React from 'react';
import { router } from 'expo-router';
import { ExpenseForm } from '../../../components';
import { createExpense, type ExpenseInput } from '../../../services/expenses';

export default function NewExpenseScreen() {
  const handleSubmit = async (input: ExpenseInput) => {
    await createExpense(input);
    router.back();
  };

  return (
    <ExpenseForm
      mode="create"
      headerTitle="Yeni Harcama"
      submitLabel="Kaydet"
      onSubmit={handleSubmit}
    />
  );
}
