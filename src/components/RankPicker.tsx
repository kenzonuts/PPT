"use client";

import type { ValorantRank } from "@/lib/types";
import { VALORANT_RANKS } from "@/lib/types";
import { RANK_GROUPS, RANK_VISUAL } from "@/lib/rank-ui";
import { useMemo, useState } from "react";

type Props = {
  id: string;
  /** Kosong = tampilkan semua pemain (mode filter admin). */
  value: ValorantRank | "";
  onChange: (rank: ValorantRank | "") => void;
};

/**
 * Panel filter rank untuk admin: cari rank + pilih tier + opsi “Semua rank”.
 * Tidak dipakai di form publik.
 */
export function RankPicker({ id, value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VALORANT_RANKS;
    return VALORANT_RANKS.filter((r) => r.toLowerCase().includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    return RANK_GROUPS.map((g) => ({
      ...g,
      ranks: g.ranks.filter((r) => filtered.includes(r)),
    })).filter((g) => g.ranks.length > 0);
  }, [filtered]);

  const showEmptyState = grouped.length === 0 && query.trim() !== "";

  return (
    <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.18)] sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <label
          id={`${id}-label`}
          htmlFor={`${id}-filter`}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Saring berdasarkan rank
        </label>
        <p className="text-xs text-[var(--muted)]">
          {value === "" ? (
            <>Menampilkan <span className="text-[var(--foreground)]">semua rank</span></>
          ) : (
            <>
              Filter aktif:{" "}
              <span className="font-medium text-[var(--accent)]">{value}</span>
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        role="radio"
        aria-checked={value === ""}
        onClick={() => onChange("")}
        className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition duration-200 ${
          value === ""
            ? "border-[var(--accent)] bg-[var(--surface-elevated)] text-[var(--foreground)] ring-2 ring-[var(--accent)]/30 ring-offset-2 ring-offset-[var(--background)]"
            : "border-[var(--border)] bg-[var(--surface-elevated)]/50 text-[var(--muted)] hover:border-[var(--accent)]/35 hover:text-[var(--foreground)]"
        }`}
      >
        Semua rank
      </button>

      <div className="relative">
        <input
          id={`${id}-filter`}
          type="search"
          enterKeyHint="search"
          placeholder="Cari rank… (mis. plat, dia)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 pl-9 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          aria-describedby={`${id}-hint`}
        />
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <p id={`${id}-hint`} className="text-xs text-[var(--muted)]">
        Fokuskan daftar peserta per rank agar lebih mudah menugaskan ke tim.
      </p>

      <div role="radiogroup" aria-labelledby={`${id}-label`} className="space-y-4">
        {showEmptyState ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] py-6 text-center text-sm text-[var(--muted)]">
            Tidak ada rank yang cocok dengan “{query.trim()}”.
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.ranks.map((rank) => {
                  const vis = RANK_VISUAL[rank];
                  const selected = value === rank;
                  return (
                    <button
                      key={rank}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onChange(rank)}
                      className={`relative flex min-h-[2.85rem] items-stretch overflow-hidden rounded-lg border text-left transition duration-200 ${
                        selected
                          ? `border-[var(--accent)] bg-[var(--surface-elevated)] ring-2 ring-offset-2 ring-offset-[var(--background)] ${vis.selectedRing}`
                          : "border-[var(--border)] bg-[var(--background)]/40 hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)]"
                      }`}
                    >
                      <span className={`w-1 shrink-0 ${vis.stripe}`} aria-hidden />
                      <span className="flex flex-1 flex-col justify-center px-2.5 py-2">
                        <span className="text-sm font-medium text-[var(--foreground)]">{rank}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
