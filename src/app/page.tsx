import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
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

      <section className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <p className="mb-4 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Jadwal & catatan penting
          </p>
          <Card className="mx-auto max-w-3xl border-[var(--accent)]/20 shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
            <CardBody className="space-y-6 sm:px-8 sm:py-8">
              <div className="border-l-2 border-[var(--accent)] pl-4">
                <h2 className="text-base font-semibold text-[var(--foreground)] sm:text-lg">
                  Waktu pertandingan
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  <span className="font-medium text-[var(--foreground)]">18 April 2026</span>
                  , pukul{" "}
                  <span className="font-medium text-[var(--foreground)]">19.30 WIB</span>.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Diusahakan sudah berkumpul pukul{" "}
                  <span className="font-medium text-[var(--foreground)]">19.15 WIB</span> untuk
                  sesi informasi dari panitia.
                </p>
              </div>
              <div className="border-l-2 border-[var(--border)] pl-4">
                <h2 className="text-base font-semibold text-[var(--foreground)] sm:text-lg">
                  Konfirmasi kehadiran
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  Wajib melakukan konfirmasi kepada admin paling lambat{" "}
                  <span className="text-[var(--foreground)]">1 hari sebelum</span> pertandingan,
                  atau paling lambat{" "}
                  <span className="text-[var(--foreground)]">2–3 jam sebelum</span> permainan
                  dimulai. Peserta yang tidak mengonfirmasi sesuai ketentuan waktu tersebut dapat{" "}
                  <span className="font-medium text-[var(--accent)]">dinyatakan diskualifikasi</span>.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 px-4 py-3 sm:px-5">
                <p className="text-sm font-medium text-[var(--foreground)]">Fair play</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                  Panitia tidak menerima segala bentuk tindakan yang berbau kecurangan.
                </p>
              </div>
            </CardBody>
          </Card>
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
