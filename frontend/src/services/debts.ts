import { apiFetch } from "./api";
import { getToken } from "./tokenStorage";

export type DebtType = "owe_me" | "i_owe" | "settled";
export type SettlementMethod = "cash" | "bank_transfer" | "other";
export type SettlementDirection = "i_paid" | "they_paid";

export const SETTLEMENT_METHOD_LABELS: Record<SettlementMethod, string> = {
  cash: "Nakit",
  bank_transfer: "Havale/EFT",
  other: "Diğer",
};

export interface PersonDebt {
  personId: string;
  personName: string;
  amount: number;
  type: DebtType;
  openTxCount: number;
  lastDate: string | null;
}

export interface DebtTransaction {
  id: string;
  kind: "expense" | "bill";
  title: string;
  date: string;
  totalAmount: number;
  shareAmount: number;
  direction: "owe_me" | "i_owe";
}

export interface PersonDebtDetail extends PersonDebt {
  transactions: DebtTransaction[];
}

export interface SettlementRecord {
  id: string;
  amount: number;
  method: SettlementMethod;
  note: string | null;
  settledAt: string;
  otherUserId: string;
  otherUserName: string;
  direction: "paid" | "received";
}

async function authedFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new Error("Oturum bulunamadı");
  }
  return apiFetch<T>(path, { ...options, token });
}

export function getMyDebts(groupId?: string): Promise<PersonDebt[]> {
  return authedFetch(groupId ? `/debts/mine?groupId=${groupId}` : "/debts/mine");
}

export function getPersonDebt(personId: string): Promise<PersonDebtDetail> {
  return authedFetch(`/debts/${personId}`);
}

export function getDebtHistory(): Promise<SettlementRecord[]> {
  return authedFetch("/debts/history");
}

export function settleDebt(input: {
  otherUserId: string;
  amount: number;
  direction: SettlementDirection;
  method: SettlementMethod;
  note: string | null;
}): Promise<SettlementRecord> {
  return authedFetch("/debts/settle", { method: "POST", body: input });
}
