import { apiFetch } from "./api";
import { getToken } from "./tokenStorage";
import type { SplitMethod } from "../hooks/useParticipantSplit";

export type { SplitMethod };

export const EXPENSE_CATEGORIES = ["Market", "Restoran", "Abonelik", "Ulaşım", "Kafe", "Diğer"];

export interface ExpenseParticipantInput {
  userId: string;
  shareAmount: number;
}

export interface ExpenseInput {
  groupId: string;
  title: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  payerId: string;
  splitMethod: SplitMethod;
  participants: ExpenseParticipantInput[];
}

export interface ExpenseSummary {
  id: string;
  title: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  splitMethod: SplitMethod;
  groupId: string;
  groupName: string;
  payerId: string;
  payerName: string;
  createdAt: string;
}

export interface ExpenseParticipant {
  userId: string;
  shareAmount: number;
  name: string;
}

export interface ExpenseDetail {
  id: string;
  groupId: string;
  title: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  payerId: string;
  payerName: string;
  splitMethod: SplitMethod;
  createdAt: string;
  participants: ExpenseParticipant[];
}

export interface AnalyticsCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface AnalyticsSpender {
  name: string;
  amount: number;
}

export interface DailyChartEntry {
  day: string;
  amount: number;
  height: number;
}

export interface ExpenseAnalytics {
  monthlyTotal: number;
  topSpender: AnalyticsSpender | null;
  topCategory: AnalyticsCategory | null;
  categories: AnalyticsCategory[];
  dailyChart: DailyChartEntry[];
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

export function getMyExpenses(): Promise<ExpenseSummary[]> {
  return authedFetch("/expenses/mine");
}

export function getExpense(expenseId: string): Promise<ExpenseDetail> {
  return authedFetch(`/expenses/${expenseId}`);
}

export function createExpense(input: ExpenseInput): Promise<ExpenseSummary> {
  return authedFetch("/expenses", { method: "POST", body: input });
}

export function updateExpense(expenseId: string, input: ExpenseInput): Promise<ExpenseSummary> {
  return authedFetch(`/expenses/${expenseId}`, { method: "PATCH", body: input });
}

export function deleteExpense(expenseId: string): Promise<{ success: true }> {
  return authedFetch(`/expenses/${expenseId}`, { method: "DELETE" });
}

export function getExpenseAnalytics(): Promise<ExpenseAnalytics> {
  return authedFetch("/expenses/analytics");
}

export function iconForCategory(category: string): keyof typeof import("@expo/vector-icons").Ionicons.glyphMap {
  switch (category) {
    case "Market":
      return "cart";
    case "Restoran":
      return "restaurant";
    case "Abonelik":
      return "tv";
    case "Ulaşım":
      return "car";
    case "Kafe":
      return "cafe";
    default:
      return "pricetag";
  }
}
