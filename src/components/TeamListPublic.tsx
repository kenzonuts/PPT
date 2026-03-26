"use client";

import { useTournament } from "@/context/tournament-context";
import { Card, CardBody } from "./ui/Card";
import { useEffect } from "react";

/** Hanya data publik: nama tim, nama player, riot id, rank — tanpa kontak. */
export function TeamListPublic() {
  const { state, hydrated, loadError, refresh, getPlayersByTeam } = useTournament();

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setInterval(() => {
      void refresh();
    }, 12000);
    return () => window.clearInterval(t);
  }, [hydrated, refresh]);

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-sm text-[var(--muted)]">Memuat pembagian tim…</p>
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

  if (state.teams.length === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-[var(--muted)]">
            Belum ada tim. Admin akan mengumumkan pembagian di sini.
          </p>
        </CardBody>
      </Card>
    );
  }

  const sortedTeams = [...state.teams].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sortedTeams.map((team) => {
        const players = getPlayersByTeam(team.id);
        return (
          <Card key={team.id} className="overflow-hidden">
            <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 sm:px-5 sm:py-4">
              <h3 className="font-semibold tracking-tight text-[var(--foreground)]">{team.name}</h3>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{players.length} pemain</p>
            </div>
            <CardBody className="py-3 sm:py-4">
              {players.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Belum ada anggota.</p>
              ) : (
                <ul className="space-y-2 sm:space-y-3">
                  {players.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col gap-0.5 rounded-lg border border-[var(--border)]/60 bg-[var(--background)]/50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-[var(--foreground)]">{p.name}</span>
                      <span className="break-all font-mono text-xs text-[var(--accent)]">
                        {p.riot_id}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{p.rank}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
