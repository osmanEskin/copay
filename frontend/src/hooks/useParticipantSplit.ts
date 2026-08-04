import { useState } from 'react';

export type SplitMethod = 'equal' | 'percentage' | 'amount';

export interface ParticipantShare {
  userId: string;
  shareAmount: number;
}

type SplitResult = { participants: ParticipantShare[] } | { error: string };

function parseNumber(text: string): number {
  return parseFloat(text.replace(',', '.')) || 0;
}

export function useParticipantSplit(
  initialIncludedUserIds: string[] = [],
  initialValues: Record<string, string> = {}
) {
  const [includedUserIds, setIncludedUserIds] = useState<Set<string>>(new Set(initialIncludedUserIds));
  const [participantValues, setParticipantValues] = useState<Record<string, string>>(initialValues);

  const toggleParticipant = (userId: string) => {
    setIncludedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const setAllIncluded = (userIds: string[]) => {
    setIncludedUserIds(new Set(userIds));
  };

  const setParticipantValue = (userId: string, text: string) => {
    setParticipantValues((prev) => ({ ...prev, [userId]: text }));
  };

  const resetForSplitMethod = (method: SplitMethod, amountText: string) => {
    if (method === 'equal') return;
    const ids = [...includedUserIds];
    if (ids.length === 0) return;
    const amountNum = parseNumber(amountText);
    const next: Record<string, string> = {};
    if (method === 'percentage') {
      const share = Math.floor(100 / ids.length);
      ids.forEach((id, i) => {
        next[id] = String(i === ids.length - 1 ? 100 - share * (ids.length - 1) : share);
      });
    } else {
      const share = Math.floor((amountNum / ids.length) * 100) / 100;
      ids.forEach((id, i) => {
        next[id] = i === ids.length - 1 ? (amountNum - share * (ids.length - 1)).toFixed(2) : share.toFixed(2);
      });
    }
    setParticipantValues(next);
  };

  const compute = (splitMethod: SplitMethod, amountText: string): SplitResult => {
    const ids = [...includedUserIds];
    if (ids.length === 0) {
      return { error: 'En az bir katılımcı seçmelisin.' };
    }
    const amountNum = parseNumber(amountText);
    if (!amountNum || amountNum <= 0) {
      return { error: 'Geçerli bir tutar girin.' };
    }

    if (splitMethod === 'equal') {
      const base = Math.floor((amountNum / ids.length) * 100) / 100;
      const shares = ids.map(() => base);
      const remainder = Math.round((amountNum - base * ids.length) * 100) / 100;
      shares[shares.length - 1] = Math.round((shares[shares.length - 1] + remainder) * 100) / 100;
      return { participants: ids.map((userId, i) => ({ userId, shareAmount: shares[i] })) };
    }

    if (splitMethod === 'percentage') {
      const percents = ids.map((id) => parseNumber(participantValues[id] ?? '0'));
      const sum = percents.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.5) {
        return { error: `Yüzdelerin toplamı 100 olmalı (şu an %${sum}).` };
      }
      const shares = percents.map((p) => Math.round(amountNum * p) / 100);
      const remainder = Math.round((amountNum - shares.reduce((a, b) => a + b, 0)) * 100) / 100;
      shares[shares.length - 1] = Math.round((shares[shares.length - 1] + remainder) * 100) / 100;
      return { participants: ids.map((userId, i) => ({ userId, shareAmount: shares[i] })) };
    }

    const amounts = ids.map((id) => parseNumber(participantValues[id] ?? '0'));
    const sum = Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100;
    if (Math.abs(sum - amountNum) > 0.5) {
      return { error: `Girilen tutarların toplamı ${amountNum} olmalı (şu an ${sum}).` };
    }
    return { participants: ids.map((userId, i) => ({ userId, shareAmount: amounts[i] })) };
  };

  return {
    includedUserIds,
    toggleParticipant,
    setAllIncluded,
    participantValues,
    setParticipantValue,
    resetForSplitMethod,
    compute,
  };
}
