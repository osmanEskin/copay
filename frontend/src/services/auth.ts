import { apiFetch } from "./api";
import { getToken, setToken, deleteToken } from "./tokenStorage";

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
  await setToken(result.token);
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
  await setToken(result.token);
  return result;
}

export { getToken };

export async function logout(): Promise<void> {
  await deleteToken();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }
  return apiFetch<AuthUser>("/auth/me", { token });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: { email, code, newPassword },
  });
}
