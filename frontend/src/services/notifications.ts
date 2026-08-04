import { apiFetch } from "./api";
import { getToken } from "./tokenStorage";

export interface RecentActivityNotification {
  id: string;
  type: "expense_added" | "bill_added";
  message: string;
  groupName: string;
  createdAt: string;
}

export interface UpcomingBillNotification {
  id: string;
  type: "bill_upcoming";
  message: string;
  groupName: string;
  dueDate: string;
}

export interface NotificationsResponse {
  upcoming: UpcomingBillNotification[];
  recent: RecentActivityNotification[];
}

export async function getNotifications(): Promise<NotificationsResponse> {
  const token = await getToken();
  if (!token) {
    throw new Error("Oturum bulunamadı");
  }
  return apiFetch<NotificationsResponse>("/notifications", { token });
}
