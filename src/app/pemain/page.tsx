import { PlayerDirectoryPublic } from "@/components/PlayerDirectoryPublic";

export default function PemainPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Daftar pemain
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Daftar publik: nama dan kontak saja. Gunakan kolom pencarian untuk menyaring nama atau
          kontak.
        </p>
      </div>
      <PlayerDirectoryPublic />
    </main>
  );
}
