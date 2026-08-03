import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./api";

const TOKEN_KEY = "auth_token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  await SecureStore.setItemAsync(TOKEN_KEY, result.token);
  return result;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  await SecureStore.setItemAsync(TOKEN_KEY, result.token);
  return result;
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }
  return apiFetch<AuthUser>("/auth/me", { token });
}
