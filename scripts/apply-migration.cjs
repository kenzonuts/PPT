/**
 * Menjalankan file SQL migrasi ke Postgres Supabase.
 *
 * Opsi A: DATABASE_URL=postgresql://... (Connection string URI dari Dashboard → Database)
 * Opsi B: SUPABASE_DB_PASSWORD=... + NEXT_PUBLIC_SUPABASE_URL (ref di-parse otomatis)
 *
 * Jalankan: npm run db:migrate
 */
const fs = require("fs");
const path = require("path");
const pg = require("pg");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
require("dotenv").config({
  path: path.join(__dirname, "..", ".env.local"),
  override: true,
  quiet: true,
});

function projectRefFromSupabaseUrl(publicUrl) {
  if (!publicUrl || typeof publicUrl !== "string") return null;
  const m = publicUrl.trim().match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m ? m[1] : null;
}

function resolveDatabaseUrl() {
  let url = process.env.DATABASE_URL;
  if (url && String(url).trim()) return String(url).trim();

  const pw = process.env.SUPABASE_DB_PASSWORD;
  if (pw && String(pw).trim()) {
    const ref =
      process.env.SUPABASE_PROJECT_REF || projectRefFromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!ref) {
      console.error(
        "SUPABASE_DB_PASSWORD ada tapi project ref tidak ketemu. Set SUPABASE_PROJECT_REF=tikr... atau pastikan NEXT_PUBLIC_SUPABASE_URL benar."
      );
      process.exit(1);
    }
    const enc = encodeURIComponent(String(pw).trim());
    return `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`;
  }

  return null;
}

const url = resolveDatabaseUrl();

if (!url) {
  console.error(
    "Tidak ada koneksi database. Pilih salah satu:\n" +
      "  • DATABASE_URL=postgresql://... (satu baris, dari Database → Connection string)\n" +
      "  • SUPABASE_DB_PASSWORD=sandi_postgres (opsi set SUPABASE_PROJECT_REF jika URL publik kosong)\n"
  );
  process.exit(1);
}

const sqlPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260326120000_init_funmatch.sql"
);

const sql = fs.readFileSync(sqlPath, "utf8");

async function main() {
  const client = new pg.Client({
    connectionString: url,
    ssl: url.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Migrasi berhasil diterapkan:", path.basename(sqlPath));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Migrasi gagal:", e.message || e);
  process.exit(1);
});
