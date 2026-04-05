/**
 * Event + panggilan API sesi admin dari klien (cookie httpOnly, tidak bisa dibaca dari JS).
 */

import { credentialsValid } from "./admin-credentials";

export { credentialsValid };

export const ADMIN_SESSION_CHANGED_EVENT = "funmatch-admin-session-changed";

export async function loginAdminSession(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const form = new FormData();
  form.set("email", email);
  form.set("password", password);
  const res = await fetch("/api/admin/session", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    return { ok: false, error: j.error ?? "Gagal masuk" };
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
  }
  return { ok: true };
}

export async function logoutAdminSession(): Promise<void> {
  await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
  }
}

export async function isAdminSessionActive(): Promise<boolean> {
  const res = await fetch("/api/admin/session", { credentials: "include" });
  if (!res.ok) return false;
  const j = (await res.json().catch(() => ({}))) as { ok?: boolean };
  return j.ok === true;
}
