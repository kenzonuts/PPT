import { findAdminAccount, normalizeAdminEmail } from "@/lib/admin-credentials";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-constants";
import { getAdminActor } from "@/lib/admin-api-auth";
import { createAdminSessionToken } from "@/lib/admin-session-crypto";
import { NextResponse } from "next/server";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const baseCookie = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function GET() {
  const actor = await getAdminActor();
  if (!actor) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, displayName: actor.displayName });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const acc = findAdminAccount(body.email ?? "", body.password ?? "");
    if (!acc) {
      return NextResponse.json({ error: "Email atau password tidak valid." }, { status: 401 });
    }
    const email = normalizeAdminEmail(acc.email);
    const token = await createAdminSessionToken({
      email,
      displayName: acc.displayName,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, { ...baseCookie, maxAge: COOKIE_MAX_AGE });
    return res;
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { ...baseCookie, maxAge: 0 });
  return res;
}
