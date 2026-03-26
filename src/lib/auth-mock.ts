/**
 * Autentikasi admin mock — untuk produksi ganti dengan Supabase Auth / session server.
 */

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from "./auth-constants";

export const MOCK_ADMIN_EMAIL = "admin@funmatch.local";
export const MOCK_ADMIN_PASSWORD = "admin123";

export function credentialsValid(email: string, password: string): boolean {
  return email.trim() === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD;
}

export function setAdminSessionCookie(): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${ADMIN_SESSION_COOKIE}=${ADMIN_SESSION_VALUE}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAdminSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isAdminSessionCookiePresent(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => {
    const [k, v] = c.trim().split("=");
    return k === ADMIN_SESSION_COOKIE && v === ADMIN_SESSION_VALUE;
  });
}
