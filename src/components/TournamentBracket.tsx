"use client";

import { useTournament } from "@/context/tournament-context";
import { useEffect } from "react";
import { Card, CardBody } from "./ui/Card";

const BRACKET_TEAM_COUNT = 20;
const HALF = 10;

function padTeamNames(names: string[], target: number): string[] {
  const out = names.slice(0, target);
  while (out.length < target) {
    out.push(`Slot ${out.length + 1}`);
  }
  return out;
}

function chunkPairs(names: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < names.length; i += 2) {
    pairs.push([names[i]!, names[i + 1]!]);
  }
  return pairs;
}

function WinnerSlots({ count }: { count: number }) {
  return (
    <div className="flex h-full min-h-[280px] flex-col justify-between border-r border-[var(--border)] py-4 pr-3 sm:min-h-[300px] sm:pr-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-[40px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)]/40 px-2 py-2 text-center text-[0.65rem] leading-tight text-[var(--muted)] sm:min-h-[44px] sm:text-xs"
        >
          —
        </div>
      ))}
    </div>
  );
}

function RoundOneColumn({ pairs }: { pairs: [string, string][] }) {
  return (
    <div className="flex flex-col justify-between gap-6 border-r border-[var(--border)] py-2 pr-3 sm:gap-7 sm:pr-4">
      {pairs.map(([a, b], idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2"
        >
          <div className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-2 text-center text-[0.7rem] font-medium leading-tight text-[var(--foreground)] sm:px-3 sm:text-xs">
            {a}
          </div>
          <span className="hidden shrink-0 text-[0.65rem] text-[var(--muted)] sm:inline">
            vs
          </span>
          <div className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-2 text-center text-[0.7rem] font-medium leading-tight text-[var(--foreground)] sm:px-3 sm:text-xs">
            {b}
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketHalf({
  seeds,
  side,
  title,
}: {
  seeds: string[];
  side: "left" | "right";
  title: string;
}) {
  const pairs = chunkPairs(padTeamNames(seeds, HALF));
  const rounds = (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <p
          className={[
            "mb-1 text-center text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted)] sm:mb-2",
            side === "right" ? "sm:text-right" : "sm:text-left",
          ].join(" ")}
        >
          {title}
        </p>
        <RoundOneColumn pairs={pairs} />
      </div>
      <WinnerSlots count={5} />
      <div className="hidden sm:block">
        <WinnerSlots count={3} />
      </div>
      <div className="hidden md:block">
        <WinnerSlots count={2} />
      </div>
      <div className="border-r-0 pr-0 sm:border-r sm:border-[var(--border)] sm:pr-3 md:pr-4">
        <div className="flex h-full min-h-[280px] flex-col justify-center py-4 sm:min-h-[300px]">
          <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,70,85,0.08)]">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--accent)]">
              Finalis {side === "left" ? "kiri" : "kanan"}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">TBD</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={
        side === "right"
          ? "flex shrink-0 flex-row-reverse gap-1 sm:gap-2"
          : "flex shrink-0 gap-1 sm:gap-2"
      }
      aria-label={title}
    >
      {rounds}
    </div>
  );
}

function BracketCenter() {
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center gap-3 px-2 sm:px-4"
      aria-label="Grand final"
    >
      <div className="rounded-lg border border-[var(--accent)]/35 bg-[var(--surface)] px-4 py-5 text-center sm:px-6 sm:py-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
          Grand final
        </p>
        <div className="mt-4 grid gap-2">
          <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--background)]/60 px-3 py-2.5 text-xs text-[var(--muted)]">
            Pemenang kiri
          </div>
          <div className="text-[0.65rem] text-[var(--muted)]">vs</div>
          <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--background)]/60 px-3 py-2.5 text-xs text-[var(--muted)]">
            Pemenang kanan
          </div>
        </div>
      </div>
    </div>
  );
}

export function TournamentBracket() {
  const { state, hydrated, loadError, refresh } = useTournament();

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setInterval(() => {
      void refresh();
    }, 12000);
    return () => window.clearInterval(t);
  }, [hydrated, refresh]);

  if (!hydrated) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-sm text-[var(--muted)]">Memuat bracket…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardBody className="py-10 text-center">
          <p className="text-sm font-medium text-red-400">Tidak dapat memuat data</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{loadError}</p>
          <button
            type="button"
            className="mt-4 text-sm text-[var(--accent)] underline-offset-4 hover:underline"
            onClick={() => void refresh()}
          >
            Coba lagi
          </button>
        </CardBody>
      </Card>
    );
  }

  const sortedTeams = [...state.teams].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const names = sortedTeams.map((t) => t.name);
  const left = names.slice(0, HALF);
  const right = names.slice(HALF, BRACKET_TEAM_COUNT);
  const extra = names.length > BRACKET_TEAM_COUNT;

  return (
    <div className="space-y-6">
      {names.length > 0 && names.length < BRACKET_TEAM_COUNT ? (
        <p className="text-sm text-[var(--muted)]">
          Saat ini ada {names.length} tim. Sisa slot diisi placeholder sampai {BRACKET_TEAM_COUNT} tim
          (10 kiri, 10 kanan).
        </p>
      ) : null}
      {extra ? (
        <p className="text-sm text-amber-200/90">
          Hanya {BRACKET_TEAM_COUNT} tim pertama (urut pembuatan) yang tampil di bracket. Total
          tim: {names.length}.
        </p>
      ) : null}
      {names.length === 0 ? (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Belum ada tim — bracket menampilkan placeholder slot. Setelah admin membuat tim, nama
          akan muncul di sini.
        </p>
      ) : null}

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex min-w-[720px] items-stretch justify-center gap-2 sm:min-w-0 sm:gap-4 md:gap-6">
          <BracketHalf seeds={left} side="left" title="10 tim kiri" />
          <BracketCenter />
          <BracketHalf seeds={right} side="right" title="10 tim kanan" />
        </div>
      </div>

      <p className="text-center text-[0.65rem] text-[var(--muted)] sm:text-xs">
        Struktur {BRACKET_TEAM_COUNT} tim: penyisihan kiri & kanan menuju grand final. Hasil
        pertandingan belum disimpan di app — slot lanjutan untuk penandaan manual.
      </p>
    </div>
  );
}
