"use client";

import { useTournament } from "@/context/tournament-context";
import { logoutAdminSession } from "@/lib/auth-mock";
import type { Player, ValorantRank } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RankPicker } from "./RankPicker";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Input } from "./ui/Input";

const selectClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-[var(--accent)]/80 focus:ring-1 focus:ring-[var(--accent)]/40";

type AuditLogItem = {
  id: string;
  created_at: string;
  actor_display_name: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown>;
};

function actionLabel(action: string): string {
  switch (action) {
    case "update_player":
      return "Ubah peserta";
    case "delete_player":
      return "Hapus peserta";
    case "create_team":
      return "Buat tim";
    case "delete_team":
      return "Hapus tim";
    case "assign_player":
      return "Pindah tim";
    default:
      return action;
  }
}

function summarizeAudit(entry: AuditLogItem): string {
  const { action, changes } = entry;
  if (action === "update_player") {
    const parts: string[] = [];
    const name = changes.name as { from?: string; to?: string } | undefined;
    const rid = changes.riot_id as { from?: string; to?: string } | undefined;
    if (name) parts.push(`nama: "${name.from}" → "${name.to}"`);
    if (rid) parts.push(`Riot ID: "${rid.from}" → "${rid.to}"`);
    return parts.join(" · ") || "Perubahan data peserta";
  }
  if (action === "assign_player") {
    const tn = changes.team_name as { from?: string | null; to?: string | null } | undefined;
    const player = changes.player as { name?: string } | undefined;
    const p = player?.name ? player.name : "Peserta";
    if (tn) {
      const f = tn.from ?? "belum ditugaskan";
      const t = tn.to ?? "belum ditugaskan";
      return `${p}: tim "${f}" → "${t}"`;
    }
    return "Penugasan tim diubah";
  }
  if (action === "create_team") {
    const n = changes.name as { to?: string } | undefined;
    return n?.to ? `Tim baru: "${n.to}"` : "Tim baru";
  }
  if (action === "delete_team") {
    const r = changes.removed as { name?: string } | undefined;
    return r?.name ? `Tim dihapus: "${r.name}"` : "Tim dihapus";
  }
  if (action === "delete_player") {
    const r = changes.removed as { name?: string; riot_id?: string } | undefined;
    if (r?.name) return `Peserta dihapus: "${r.name}" (${r.riot_id ?? "—"})`;
    return "Peserta dihapus";
  }
  return "";
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition ${
        accent
          ? "border-[var(--accent)]/25 bg-[var(--surface-elevated)] shadow-[0_0_0_1px_rgba(255,70,85,0.12)]"
          : "border-[var(--border)] bg-[var(--surface)]/90"
      }`}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-[1.75rem]">
        {value}
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
      <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {children}
      </span>
      <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
    </div>
  );
}

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
    deletePlayer,
    updatePlayer,
    getTeamForPlayer,
  } = useTournament();
  const [newTeamName, setNewTeamName] = useState("");
  const [rankFilter, setRankFilter] = useState<ValorantRank | "">("");
  const [nameSearch, setNameSearch] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [riotDraft, setRiotDraft] = useState("");

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
    let list = playersSorted;
    if (rankFilter) list = list.filter((p) => p.rank === rankFilter);
    const q = nameSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.riot_id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [playersSorted, rankFilter, nameSearch]);

  const listDescription = useMemo(() => {
    const total = playersSorted.length;
    const shown = playersFiltered.length;
    const parts: string[] = [];
    if (rankFilter) parts.push(`rank ${rankFilter}`);
    const nq = nameSearch.trim();
    if (nq) parts.push(`nama / Riot ID “${nq}”`);
    if (parts.length === 0) return `Semua pendaftar · ${total} orang.`;
    return `Filter: ${parts.join(" · ")} — menampilkan ${shown} dari ${total} peserta.`;
  }, [playersSorted.length, playersFiltered.length, rankFilter, nameSearch]);

  const assignedPlayerIds = useMemo(
    () => new Set(state.team_members.map((m) => m.player_id)),
    [state.team_members]
  );

  const stats = useMemo(() => {
    const total = playersSorted.length;
    const assigned = assignedPlayerIds.size;
    return {
      total,
      assigned,
      unassigned: Math.max(0, total - assigned),
      teams: teamsSorted.length,
    };
  }, [playersSorted.length, assignedPlayerIds, teamsSorted.length]);

  const teamMemberCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const tm of state.team_members) {
      m.set(tm.team_id, (m.get(tm.team_id) ?? 0) + 1);
    }
    return m;
  }, [state.team_members]);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/admin/audit?limit=40", { credentials: "include" });
      if (!res.ok) return;
      const j = (await res.json()) as { logs?: AuditLogItem[] };
      setAuditLogs(j.logs ?? []);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || loadError) return;
    void loadAuditLogs();
  }, [hydrated, loadError, loadAuditLogs]);

  async function handleLogout() {
    await logoutAdminSession();
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

  function startEditPlayer(p: Player) {
    setEditingPlayerId(p.id);
    setNameDraft(p.name);
    setRiotDraft(p.riot_id);
  }

  function cancelEditPlayer() {
    setEditingPlayerId(null);
    setNameDraft("");
    setRiotDraft("");
  }

  async function savePlayerEdits(playerId: string) {
    const n = nameDraft.trim();
    const rid = riotDraft.trim();
    if (!n) {
      window.alert("Nama tidak boleh kosong.");
      return;
    }
    if (!rid) {
      window.alert("Riot ID wajib diisi.");
      return;
    }
    if (!rid.includes("#")) {
      window.alert(
        "Riot ID harus memuat tanda # (contoh: Nama#tag), sesuai yang di game."
      );
      return;
    }
    try {
      await updatePlayer(playerId, { name: n, riot_id: rid });
      cancelEditPlayer();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    }
  }

  async function handleDeletePlayer(p: Player) {
    if (
      !confirm(
        `Hapus peserta "${p.name}" (${p.riot_id}) dari daftar?\n\nJika peserta ada di tim, entri tim ikut dihapus. Tindakan ini tidak bisa dibatalkan.`
      )
    ) {
      return;
    }
    try {
      await deletePlayer(p.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus peserta");
    }
  }

  if (!hydrated) {
    return (
      <div className="space-y-8">
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface)]" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[var(--surface)]" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-[var(--surface)]" />
        <p className="text-center text-sm text-[var(--muted)]">Memuat data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/35 bg-[linear-gradient(135deg,rgba(220,38,38,0.12)_0%,rgba(220,38,38,0.04)_100%)] px-5 py-4 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <p className="font-semibold text-red-200">Tidak dapat memuat data</p>
          <p className="mt-1.5 text-red-200/90">{loadError}</p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            onClick={() => void refresh()}
          >
            Muat ulang
          </button>
        </div>
      ) : null}

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
            Panel panitia
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Dashboard
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Atur pemain, bentuk tim, dan pastikan pembagian terlihat di halaman publik. Data sensitif
            tetap hanya di sini.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/live" target="_blank" rel="noopener noreferrer" className="sm:shrink-0">
            <Button variant="secondary" className="w-full min-h-[44px] sm:w-auto">
              Lihat halaman publik
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => void handleLogout()}
            className="w-full min-h-[44px] border border-[var(--border)] sm:w-auto"
          >
            Keluar
          </Button>
        </div>
      </header>

      <section aria-label="Ringkasan">
        <SectionLabel>Ringkasan</SectionLabel>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard label="Total peserta" value={stats.total} />
          <StatCard label="Sudah di tim" value={stats.assigned} />
          <StatCard label="Belum ditugaskan" value={stats.unassigned} accent={stats.unassigned > 0} />
          <StatCard label="Jumlah tim" value={stats.teams} />
        </div>
      </section>

      <section aria-label="Riwayat perubahan">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 [&_.mb-3]:mb-0">
            <SectionLabel>Riwayat perubahan admin</SectionLabel>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 self-start sm:self-center"
            disabled={auditLoading}
            onClick={() => void loadAuditLogs()}
          >
            {auditLoading ? "Memuat…" : "Perbarui riwayat"}
          </Button>
        </div>
        <Card className="shadow-[0_8px_40px_rgba(0,0,0,0.22)]">
          <CardBody className="p-0">
            {auditLogs.length === 0 && !auditLoading ? (
              <p className="px-5 py-10 text-center text-sm text-[var(--muted)]">
                Belum ada aktivitas tercatat.
              </p>
            ) : (
              <div className="max-h-[min(420px,50vh)] overflow-auto">
                <ul className="divide-y divide-[var(--border)]/80 text-sm">
                  {auditLogs.map((log) => {
                    const when = new Date(log.created_at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    });
                    const summary = summarizeAudit(log);
                    return (
                      <li key={log.id} className="px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-medium text-[var(--accent)]">
                            {log.actor_display_name}
                          </span>
                          <span className="text-[var(--muted)]">·</span>
                          <span className="text-[var(--muted)]">{when}</span>
                        </div>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          {actionLabel(log.action)}
                        </p>
                        {summary ? (
                          <p className="mt-1 text-[var(--foreground)]/95">{summary}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-6">
          <div className="space-y-4">
            <SectionLabel>Filter & pencarian</SectionLabel>
            <Input
              id="admin-name-search"
              label="Cari nama atau Riot ID"
              placeholder="Ketik nama atau Riot ID…"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              autoComplete="off"
              hint="Tidak case-sensitive; mencocokkan bagian nama atau Riot ID."
            />
            <RankPicker id="admin-rank-filter" value={rankFilter} onChange={setRankFilter} />
          </div>

          <Card className="overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.28)]">
            <CardHeader title="Daftar peserta" description={listDescription} />
            <CardBody className="p-0">
              {playersSorted.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">Belum ada pendaftar</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
                    Bagikan link pendaftaran. Data akan muncul di tabel ini otomatis.
                  </p>
                </div>
              ) : playersFiltered.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-[var(--muted)]">
                  Tidak ada peserta yang cocok dengan filter saat ini. Sesuaikan pencarian,
                  pilih &quot;Semua rank&quot;, atau kosongkan kolom cari.
                </div>
              ) : (
                <>
                  <div className="space-y-3 p-4 sm:p-5 lg:hidden">
                    {playersFiltered.map((p) => {
                      const team = getTeamForPlayer(p.id);
                      return (
                        <div
                          key={p.id}
                          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 pl-4 pr-4 py-4 shadow-[inset_3px_0_0_var(--accent)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {editingPlayerId === p.id ? (
                                <div className="space-y-2">
                                  <input
                                    id={`name-edit-${p.id}`}
                                    className={`${selectClass} font-medium`}
                                    value={nameDraft}
                                    onChange={(e) => setNameDraft(e.target.value)}
                                    autoComplete="off"
                                    aria-label="Edit nama peserta"
                                  />
                                  <input
                                    id={`riot-edit-${p.id}`}
                                    className={`${selectClass} font-mono text-xs`}
                                    value={riotDraft}
                                    onChange={(e) => setRiotDraft(e.target.value)}
                                    autoComplete="off"
                                    aria-label="Edit Riot ID"
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      type="button"
                                      className="px-3 py-1.5 text-xs"
                                      onClick={() => void savePlayerEdits(p.id)}
                                    >
                                      Simpan
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="px-3 py-1.5 text-xs"
                                      onClick={cancelEditPlayer}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-[var(--foreground)]">{p.name}</p>
                                    <button
                                      type="button"
                                      className="text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                                      onClick={() => startEditPlayer(p)}
                                    >
                                      Ubah
                                    </button>
                                  </div>
                                  <p className="mt-1 break-all font-mono text-xs text-[var(--accent)]">
                                    {p.riot_id}
                                  </p>
                                </>
                              )}
                            </div>
                            <span className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)]/40 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-[var(--muted)]">
                              {p.rank}
                            </span>
                          </div>
                          <p className="mt-3 break-words text-xs text-[var(--muted)]">{p.contact}</p>
                          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Penugasan tim
                            <select
                              value={team?.id ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                void handleAssign(p, v === "" ? null : v);
                              }}
                              className={`mt-1.5 ${selectClass}`}
                            >
                              <option value="">Belum ditugaskan</option>
                              {teamsSorted.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            className="mt-3 w-full border border-red-500/25 text-red-400 hover:border-red-500/45 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => void handleDeletePlayer(p)}
                          >
                            Hapus peserta
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden lg:block">
                    <div className="max-h-[min(72vh,880px)] overflow-auto">
                      <table className="w-full min-w-[840px] text-left text-sm">
                        <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                          <tr className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                            <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Nama</th>
                            <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Riot ID</th>
                            <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Rank</th>
                            <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Kontak</th>
                            <th className="min-w-[148px] whitespace-nowrap px-5 py-3.5 font-semibold">
                              Tim
                            </th>
                            <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-right">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]/80">
                          {playersFiltered.map((p) => {
                            const team = getTeamForPlayer(p.id);
                            return (
                              <tr
                                key={p.id}
                                className="bg-[var(--surface)]/30 transition hover:bg-[var(--surface-elevated)]/40"
                              >
                                <td className="min-w-[200px] px-5 py-3.5 align-top">
                                  {editingPlayerId === p.id ? (
                                    <div className="flex max-w-[240px] flex-col gap-2">
                                      <input
                                        className={`${selectClass} font-medium`}
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        autoComplete="off"
                                        aria-label={`Edit nama peserta`}
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          type="button"
                                          className="px-3 py-1.5 text-xs"
                                          onClick={() => void savePlayerEdits(p.id)}
                                        >
                                          Simpan
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="px-3 py-1.5 text-xs"
                                          onClick={cancelEditPlayer}
                                        >
                                          Batal
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-medium text-[var(--foreground)]">
                                        {p.name}
                                      </span>
                                      <button
                                        type="button"
                                        className="shrink-0 text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                                        onClick={() => startEditPlayer(p)}
                                      >
                                        Ubah
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="max-w-[200px] px-5 py-3.5 align-top font-mono text-xs text-[var(--accent)]">
                                  {editingPlayerId === p.id ? (
                                    <input
                                      className={`${selectClass} w-full max-w-[220px]`}
                                      value={riotDraft}
                                      onChange={(e) => setRiotDraft(e.target.value)}
                                      autoComplete="off"
                                      aria-label="Edit Riot ID"
                                    />
                                  ) : (
                                    <span className="block truncate" title={p.riot_id}>
                                      {p.riot_id}
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-[var(--muted)]">{p.rank}</td>
                                <td className="max-w-[200px] truncate px-5 py-3.5 text-[var(--muted)]">
                                  {p.contact}
                                </td>
                                <td className="px-5 py-3">
                                  <select
                                    value={team?.id ?? ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      void handleAssign(p, v === "" ? null : v);
                                    }}
                                    className={`${selectClass} !py-1.5 text-xs`}
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
                                <td className="px-5 py-3 text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-lg border border-red-500/25 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/45 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={() => void handleDeletePlayer(p)}
                                  >
                                    Hapus
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
          <Card className="border-l-[3px] border-l-[var(--accent)] shadow-[0_8px_40px_rgba(0,0,0,0.22)]">
            <CardHeader
              title="Buat tim baru"
              description="Tim akan muncul di dropdown penugasan dan di halaman publik."
            />
            <CardBody>
              <form onSubmit={(e) => void handleCreateTeam(e)} className="space-y-4">
                <Input
                  id="new-team-name"
                  label="Nama tim"
                  placeholder="Contoh: Team Alpha"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
                <Button type="submit" className="w-full min-h-[46px]" disabled={!newTeamName.trim()}>
                  Buat tim
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card className="shadow-[0_8px_40px_rgba(0,0,0,0.22)]">
            <CardHeader
              title="Daftar tim"
              description="Menghapus tim melepaskan anggotanya dari penugasan."
            />
            <CardBody className="space-y-2">
              {teamsSorted.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-[var(--muted)]">
                  Belum ada tim. Buat tim di atas.
                </p>
              ) : (
                <ul className="space-y-2">
                  {teamsSorted.map((t) => {
                    const n = teamMemberCount.get(t.id) ?? 0;
                    return (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 px-4 py-3 transition hover:border-[var(--accent)]/25"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--foreground)]">{t.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">{n} pemain</p>
                        </div>
                        <Button
                          variant="ghost"
                          className="shrink-0 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                          type="button"
                          onClick={() => void handleDeleteTeam(t.id, t.name)}
                        >
                          Hapus
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
