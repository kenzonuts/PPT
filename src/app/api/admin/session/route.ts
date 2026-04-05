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

function parseCredentials(request: Request): Promise<{ email: string; password: string } | null> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return request
      .text()
      .then((raw) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        try {
          const body = JSON.parse(trimmed) as { email?: string; password?: string };
          return {
            email: String(body.email ?? ""),
            password: String(body.password ?? ""),
          };
        } catch {
          return null;
        }
      })
      .catch(() => null);
  }
  return request
    .formData()
    .then((form) => ({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    }))
    .catch(() => null);
}

export async function POST(request: Request) {
  const creds = await parseCredentials(request);
  if (!creds) {
    return NextResponse.json(
      { error: "Permintaan tidak valid atau body kosong. Muat ulang halaman dan coba lagi." },
      { status: 400 },
    );
  }

  const acc = findAdminAccount(creds.email, creds.password);
  if (!acc) {
    return NextResponse.json({ error: "Email atau password tidak valid." }, { status: 401 });
  }

  let token: string;
  try {
    const email = normalizeAdminEmail(acc.email);
    token = await createAdminSessionToken({
      email,
      displayName: acc.displayName,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("ADMIN_SESSION_SECRET")) {
      return NextResponse.json(
        {
          error:
            "Server belum dikonfigurasi: tambahkan ENV ADMIN_SESSION_SECRET (minimal 16 karakter) di panel deploy, lalu redeploy.",
        },
        { status: 503 },
      );
    }
    console.error("admin session token error", e);
    return NextResponse.json({ error: "Gagal membuat sesi." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, { ...baseCookie, maxAge: COOKIE_MAX_AGE });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { ...baseCookie, maxAge: 0 });
  return res;
}
