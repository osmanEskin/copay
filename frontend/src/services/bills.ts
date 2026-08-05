import { apiFetch } from "./api";
import { getToken } from "./tokenStorage";
import type { SplitMethod } from "../hooks/useParticipantSplit";

export const BILL_CATEGORIES = [
  "Fatura",
  "Abonelik",
  "Kira",
  "Elektrik",
  "Su",
  "Doğalgaz",
  "İnternet",
  "Aidat",
  "Diğer",
];

export type BillStatus = "Bekliyor" | "Yaklaşan" | "Geciken" | "Ödendi";
export type BillRecurrence = "none" | "weekly" | "monthly" | "quarterly" | "semiannual" | "yearly";
export type BillReminder = "none" | "1_day" | "3_days" | "1_week";

export const RECURRENCE_LABELS: Record<BillRecurrence, string> = {
  none: "Tek Sefer",
  weekly: "Haftalık",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  semiannual: "6 Aylık",
  yearly: "Yıllık",
};

export const REMINDER_LABELS: Record<BillReminder, string> = {
  none: "Yok",
  "1_day": "1 gün önce",
  "3_days": "3 gün önce",
  "1_week": "1 hafta önce",
};

export interface BillParticipantInput {
  userId: string;
  shareAmount: number;
}

export interface BillInput {
  groupId: string;
  title: string;
  category: string;
  description: string | null;
  amount: number;
  billDate: string;
  dueDate: string;
  payerId: string;
  splitMethod: SplitMethod;
  recurrence: BillRecurrence;
  reminder: BillReminder;
  variableAmount: boolean;
  participants: BillParticipantInput[];
}

export interface BillSummary {
  id: string;
  title: string;
  category: string;
  description: string | null;
  amount: number;
  billDate: string;
  dueDate: string;
  splitMethod: SplitMethod;
  recurrence: BillRecurrence;
  reminder: BillReminder;
  variableAmount: boolean;
  paidAt: string | null;
  status: BillStatus;
  groupId: string;
  groupName: string;
  payerId: string;
  payerName: string;
  createdAt: string;
}

export interface BillParticipant {
  userId: string;
  shareAmount: number;
  name: string;
}

export interface BillDetail extends BillSummary {
  participants: BillParticipant[];
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

export function getMyBills(groupId?: string): Promise<BillSummary[]> {
  return authedFetch(groupId ? `/bills/mine?groupId=${groupId}` : "/bills/mine");
}

export function getBillHistory(): Promise<BillSummary[]> {
  return authedFetch("/bills/history");
}

export function getRecurringBills(): Promise<BillSummary[]> {
  return authedFetch("/bills/recurring");
}

export function getBill(billId: string): Promise<BillDetail> {
  return authedFetch(`/bills/${billId}`);
}

export function createBill(input: BillInput): Promise<BillSummary> {
  return authedFetch("/bills", { method: "POST", body: input });
}

export function updateBill(billId: string, input: BillInput): Promise<BillSummary> {
  return authedFetch(`/bills/${billId}`, { method: "PATCH", body: input });
}

export function markBillPaid(billId: string): Promise<BillSummary> {
  return authedFetch(`/bills/${billId}/pay`, { method: "POST" });
}

export function deleteBill(billId: string): Promise<{ success: true }> {
  return authedFetch(`/bills/${billId}`, { method: "DELETE" });
}

export function iconForBillCategory(category: string): keyof typeof import("@expo/vector-icons").Ionicons.glyphMap {
  switch (category) {
    case "Fatura":
      return "flash";
    case "Abonelik":
      return "wifi";
    case "Kira":
      return "home";
    case "Elektrik":
      return "flash-outline";
    case "Su":
      return "water-outline";
    case "Doğalgaz":
      return "flame-outline";
    case "İnternet":
      return "wifi-outline";
    case "Aidat":
      return "business";
    default:
      return "pricetag";
  }
}
