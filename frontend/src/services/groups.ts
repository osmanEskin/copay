import { apiFetch } from "./api";
import { getToken } from "./tokenStorage";

export type GroupRole = "admin" | "member";

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  role: GroupRole;
  memberCount: number;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  name: string;
  email: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  members: GroupMember[];
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

export function getMyGroups(): Promise<Group[]> {
  return authedFetch("/groups/mine");
}

export function getGroup(groupId: string): Promise<GroupDetail> {
  return authedFetch(`/groups/${groupId}`);
}

export function createGroup(name: string): Promise<Group> {
  return authedFetch("/groups", { method: "POST", body: { name } });
}

export function joinGroup(code: string): Promise<Group> {
  return authedFetch("/groups/join", { method: "POST", body: { code } });
}

export function updateMemberRole(
  groupId: string,
  userId: string,
  role: GroupRole
): Promise<{ success: true }> {
  return authedFetch(`/groups/${groupId}/members/${userId}`, {
    method: "PATCH",
    body: { role },
  });
}

export function removeMember(groupId: string, userId: string): Promise<{ success: true }> {
  return authedFetch(`/groups/${groupId}/members/${userId}`, { method: "DELETE" });
}
