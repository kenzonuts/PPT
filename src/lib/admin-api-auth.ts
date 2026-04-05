import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-constants";
import type { AdminActor } from "@/lib/admin-audit";
import { verifyAdminSessionToken } from "@/lib/admin-session-crypto";

export async function getAdminActor(): Promise<AdminActor | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyAdminSessionToken(token);
  if (!payload) return null;
  return { email: payload.email, displayName: payload.displayName };
}

export async function isAdminRequest(): Promise<boolean> {
  return (await getAdminActor()) !== null;
}
