import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 40%, #ff4655 100%), linear-gradient(225deg, #0f1923 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:py-40">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--accent)] sm:text-xs">
            Event komunitas
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl lg:text-6xl">
            Para Pencari Tuhan — Fun Match Valorant
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-lg">
            Fun, santai, no toxic, community-based. Daftar sebagai individu; pembagian tim
            sepenuhnya oleh panitia — kamu hanya melihat hasilnya di halaman publik.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full min-h-[48px] px-8 py-3 text-base sm:min-w-[160px] sm:w-auto">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/live" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full min-h-[48px] px-8 py-3 text-base sm:min-w-[160px] sm:w-auto"
              >
                Lihat Pembagian Tim
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)]/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:gap-10 sm:px-6 sm:py-16">
          {[
            {
              title: "Solo registration",
              body: "Semua peserta mendaftar sebagai individu tanpa membentuk tim.",
            },
            {
              title: "Privasi data",
              body: "Detail pendaftaran tidak dipublikasikan. Hanya nama & tag yang muncul di tim.",
            },
            {
              title: "Live teams",
              body: "Setelah admin menugaskan, pembagian tim terlihat langsung di halaman publik.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-2">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">{item.title}</h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
