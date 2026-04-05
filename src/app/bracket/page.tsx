import { TournamentBracket } from "@/components/TournamentBracket";

export default function BracketPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Bracket turnamen
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Bracket 20 tim: 10 kiri dan 10 kanan menuju grand final. Nama tim mengikuti pembagian
          (urut waktu dibuat). Lebih dari 20 tim hanya 20 pertama yang tampil di sini.
        </p>
      </div>
      <TournamentBracket />
    </main>
  );
}
