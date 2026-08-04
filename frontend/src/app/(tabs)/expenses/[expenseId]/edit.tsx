import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ExpenseForm, Screen, Loading } from '../../../../components';
import { colors } from '../../../../theme';
import { getExpense, updateExpense, type ExpenseInput } from '../../../../services/expenses';
import type { ExpenseFormInitialValues } from '../../../../components/ExpenseForm';

export default function EditExpenseScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const [initialValues, setInitialValues] = useState<ExpenseFormInitialValues | null>(null);

  useEffect(() => {
    getExpense(expenseId).then((expense) => {
      setInitialValues({
        groupId: expense.groupId,
        title: expense.title,
        category: expense.category,
        description: expense.description ?? '',
        date: expense.date,
        amount: String(expense.amount),
        payerId: expense.payerId,
        splitMethod: expense.splitMethod,
        participants: expense.participants.map((p) => ({ userId: p.userId, shareAmount: p.shareAmount })),
      });
    });
  }, [expenseId]);

  const handleSubmit = async (input: ExpenseInput) => {
    await updateExpense(expenseId, input);
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
    <ExpenseForm
      mode="edit"
      headerTitle="Harcamayı Düzenle"
      submitLabel="Güncelle"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
