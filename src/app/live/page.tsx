import { TeamListPublic } from "@/components/TeamListPublic";

export default function LivePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Pembagian tim (live)
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Tampilan publik: nama panggilan, Riot ID, dan rank per tim. Kontak dan detail lain tidak
          ditampilkan. Perubahan dari admin akan terlihat di perangkat ini secara langsung
          (sinkron antar-tab lewat penyimpanan browser).
        </p>
      </div>
      <TeamListPublic />
    </main>
  );
}
