import { apiFetch } from "./api";
import { getToken, setToken, deleteToken } from "./tokenStorage";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface TwoFactorRequiredResponse {
  twoFactorRequired: true;
  email: string;
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
): Promise<AuthResponse | TwoFactorRequiredResponse> {
  const result = await apiFetch<AuthResponse | TwoFactorRequiredResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if ("token" in result) {
    await setToken(result.token);
  }
  return result;
}

export async function verifyTwoFactor(email: string, code: string): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/login/verify-2fa", {
    method: "POST",
    body: { email, code },
  });
  await setToken(result.token);
  return result;
}

export async function setTwoFactorEnabled(
  enabled: boolean,
  password: string
): Promise<{ twoFactorEnabled: boolean }> {
  const token = await getToken();
  if (!token) {
    throw new Error("Oturum bulunamadı");
  }
  return apiFetch("/auth/2fa", {
    method: "PATCH",
    body: { enabled, password },
    token,
  });
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
