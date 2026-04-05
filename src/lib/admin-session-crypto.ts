/**
 * Sesi admin bertanda HMAC — kompatibel Edge (middleware) dan Node (route handlers).
 */

export type AdminSessionPayload = {
  email: string;
  displayName: string;
  exp: number;
};

const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

function getSecretBytes(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET wajib di-set (minimal 16 karakter) untuk produksi.");
    }
    return new TextEncoder().encode("funmatch-dev-admin-secret-please-set-env");
  }
  return new TextEncoder().encode(s);
}

async function importKey(): Promise<CryptoKey> {
  const raw = new Uint8Array(getSecretBytes());
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)!;
  return out;
}

export async function createAdminSessionToken(actor: {
  email: string;
  displayName: string;
}): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload: AdminSessionPayload = {
    email: actor.email,
    displayName: actor.displayName,
    exp,
  };
  const json = JSON.stringify(payload);
  const data = new TextEncoder().encode(json);
  const key = await importKey();
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
  return `${bytesToBase64Url(data)}.${bytesToBase64Url(sig)}`;
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const payloadPart = token.slice(0, i);
  const sigPart = token.slice(i + 1);
  try {
    const data = new Uint8Array(base64UrlToBytes(payloadPart));
    const sig = new Uint8Array(base64UrlToBytes(sigPart));
    const key = await importKey();
    const ok = await crypto.subtle.verify("HMAC", key, sig, data);
    if (!ok) return null;
    const parsed = JSON.parse(new TextDecoder().decode(data)) as AdminSessionPayload;
    if (typeof parsed.exp !== "number" || Date.now() / 1000 > parsed.exp) return null;
    if (typeof parsed.email !== "string" || typeof parsed.displayName !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
}
