"use client";

import { useTournament } from "@/context/tournament-context";
import { clearAdminSessionCookie } from "@/lib/auth-mock";
import type { Player, ValorantRank } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { RankPicker } from "./RankPicker";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Input } from "./ui/Input";

export function AdminDashboard() {
  const router = useRouter();
  const {
    state,
    hydrated,
    loadError,
    refresh,
    createTeam,
    assignPlayerToTeam,
    deleteTeam,
    getTeamForPlayer,
  } = useTournament();
  const [newTeamName, setNewTeamName] = useState("");
  const [rankFilter, setRankFilter] = useState<ValorantRank | "">("");

  const teamsSorted = useMemo(
    () =>
      [...state.teams].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [state.teams]
  );

  const playersSorted = useMemo(
    () =>
      [...state.players].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [state.players]
  );

  const playersFiltered = useMemo(() => {
    if (!rankFilter) return playersSorted;
    return playersSorted.filter((p) => p.rank === rankFilter);
  }, [playersSorted, rankFilter]);

  function handleLogout() {
    clearAdminSessionCookie();
    router.push("/login");
    router.refresh();
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    try {
      await createTeam(name);
      setNewTeamName("");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal membuat tim");
    }
  }

  async function handleAssign(p: Player, teamId: string | null) {
    try {
      await assignPlayerToTeam(p.id, teamId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal mengubah tim");
    }
  }

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Hapus ${teamName}? Anggota akan dilepas dari tim.`)) return;
    try {
      await deleteTeam(teamId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus tim");
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Memuat data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          <p className="font-medium">Tidak dapat memuat data dari Supabase</p>
          <p className="mt-1 text-red-200/90">{loadError}</p>
          <button
            type="button"
            className="mt-3 text-[var(--accent)] underline-offset-4 hover:underline"
            onClick={() => void refresh()}
          >
            Muat ulang
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Kelola pemain dan pembentukan tim secara manual.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/live" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" className="w-full sm:w-auto">
              Lihat tampilan publik
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto">
            Keluar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="min-w-0 space-y-4">
          <RankPicker id="admin-rank-filter" value={rankFilter} onChange={setRankFilter} />
          <Card>
            <CardHeader
              title="Daftar peserta"
              description={
                rankFilter
                  ? `Hanya menampilkan rank ${rankFilter}. ${playersFiltered.length} dari ${playersSorted.length} peserta.`
                  : `Data lengkap untuk keperluan admin · ${playersSorted.length} peserta.`
              }
            />
            <CardBody className="p-0">
              {playersSorted.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                  Belum ada pendaftar.
                </div>
              ) : playersFiltered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                  Tidak ada peserta dengan rank ini. Ubah filter atau pilih &quot;Semua rank&quot;.
                </div>
              ) : (
                <>
                  <div className="space-y-3 p-4 lg:hidden">
                    {playersFiltered.map((p) => {
                      const team = getTeamForPlayer(p.id);
                      return (
                        <div
                          key={p.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                        >
                          <p className="font-medium text-[var(--foreground)]">{p.name}</p>
                          <p className="mt-1 font-mono text-xs text-[var(--accent)]">{p.riot_id}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{p.rank}</p>
                          <p className="mt-2 break-words text-xs text-[var(--muted)]">
                            {p.contact}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{p.availability}</p>
                          <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
                            Tim
                            <select
                              value={team?.id ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                void handleAssign(p, v === "" ? null : v);
                              }}
                              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                            >
                              <option value="">— Belum ditugaskan —</option>
                              {teamsSorted.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)] text-xs uppercase tracking-wide text-[var(--muted)]">
                          <th className="px-4 py-3 font-medium">Nama</th>
                          <th className="px-4 py-3 font-medium">Riot ID</th>
                          <th className="px-4 py-3 font-medium">Rank</th>
                          <th className="px-4 py-3 font-medium">Kontak</th>
                          <th className="px-4 py-3 font-medium">Ketersediaan</th>
                          <th className="px-4 py-3 font-medium">Tim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playersFiltered.map((p) => {
                          const team = getTeamForPlayer(p.id);
                          return (
                            <tr
                              key={p.id}
                              className="border-b border-[var(--border)]/80 last:border-0 hover:bg-white/[0.02]"
                            >
                              <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                                {p.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-[var(--accent)]">
                                {p.riot_id}
                              </td>
                              <td className="px-4 py-3 text-[var(--muted)]">{p.rank}</td>
                              <td className="max-w-[140px] truncate px-4 py-3 text-[var(--muted)]">
                                {p.contact}
                              </td>
                              <td className="max-w-[160px] truncate px-4 py-3 text-[var(--muted)]">
                                {p.availability}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={team?.id ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    void handleAssign(p, v === "" ? null : v);
                                  }}
                                  className="w-full min-w-[120px] rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                                  aria-label={`Pindahkan ${p.name} ke tim`}
                                >
                                  <option value="">— Belum ditugaskan —</option>
                                  {teamsSorted.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Buat tim" description="Nama tim terserah (mis. Team A)." />
            <CardBody>
              <form onSubmit={(e) => void handleCreateTeam(e)} className="space-y-4">
                <Input
                  id="new-team-name"
                  label="Nama tim"
                  placeholder="Team A"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
                <Button type="submit" className="w-full" disabled={!newTeamName.trim()}>
                  Buat Team
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Daftar tim"
              description="Hapus tim mengembalikan anggota ke belum ditugaskan."
            />
            <CardBody className="space-y-3">
              {teamsSorted.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Belum ada tim.</p>
              ) : (
                <ul className="space-y-2">
                  {teamsSorted.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-[var(--foreground)]">
                        {t.name}
                      </span>
                      <Button
                        variant="ghost"
                        className="shrink-0 px-2 py-1 text-xs text-red-400 hover:text-red-300"
                        type="button"
                        onClick={() => void handleDeleteTeam(t.id, t.name)}
                      >
                        Hapus
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
