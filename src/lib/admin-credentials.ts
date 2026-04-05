/**
 * Akun admin mock — untuk produksi ganti dengan penyimpanan aman + Supabase Auth.
 */

export type AdminAccount = {
  email: string;
  password: string;
  displayName: string;
};

const ACCOUNTS: ReadonlyArray<AdminAccount> = [
  { email: "tuanmudakenzo@kenzo.id", password: "lagigamood", displayName: "kenzo" },
  { email: "Yahahadmin@gmail.com", password: "1=1", displayName: "yaha" },
  { email: "bellacantik@gmail.com", password: "bellacantik", displayName: "bella" },
];

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findAdminAccount(
  email: string,
  password: string,
): AdminAccount | undefined {
  const n = normalizeAdminEmail(email);
  return ACCOUNTS.find((c) => normalizeAdminEmail(c.email) === n && c.password === password);
}

/** Validasi cepat di klien; server selalu memvalidasi di POST /api/admin/session. */
export function credentialsValid(email: string, password: string): boolean {
  return findAdminAccount(email, password) !== undefined;
}
