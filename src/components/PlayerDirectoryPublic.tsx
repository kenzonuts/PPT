"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PublicPlayerDirectoryRow } from "@/lib/supabase/public-player-directory";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody } from "./ui/Card";
import { Input } from "./ui/Input";

async function fetchDirectory(): Promise<PublicPlayerDirectoryRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_public_player_directory");
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicPlayerDirectoryRow[];
}

function matchesQuery(row: PublicPlayerDirectoryRow, q: string): boolean {
  const n = row.name.toLowerCase();
  const c = row.contact.toLowerCase();
  return n.includes(q) || c.includes(q);
}

export function PlayerDirectoryPublic() {
  const [rows, setRows] = useState<PublicPlayerDirectoryRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const next = await fetchDirectory();
        if (cancelled || !mounted.current) return;
        setLoadError(null);
        setRows(next);
      } catch (e) {
        console.error(e);
        if (cancelled || !mounted.current) return;
        setLoadError(e instanceof Error ? e.message : "Gagal memuat daftar");
        setRows([]);
      }
    }

    void run();
    const t = window.setInterval(() => {
      void run();
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => matchesQuery(p, q));
  }, [rows, query]);

  async function retry() {
    setLoadError(null);
    setRows(null);
    try {
      const next = await fetchDirectory();
      if (!mounted.current) return;
      setLoadError(null);
      setRows(next);
    } catch (e) {
      console.error(e);
      if (!mounted.current) return;
      setLoadError(e instanceof Error ? e.message : "Gagal memuat daftar");
      setRows([]);
    }
  }

  if (rows === null) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-sm text-[var(--muted)]">Memuat daftar pemain…</p>
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
            onClick={() => void retry()}
          >
            Coba lagi
          </button>
        </CardBody>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardBody className="py-14 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">Belum ada pemain</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Daftar akan terisi setelah ada pendaftaran.
          </p>
        </CardBody>
      </Card>
    );
  }

  const total = rows.length;
  const shown = filtered.length;
  const qTrim = query.trim();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)]/35 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <Input
              id="player-directory-search"
              label="Cari pemain"
              type="search"
              autoComplete="off"
              placeholder="Ketik nama atau kontak…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              hint="Rank dan Riot ID tidak ditampilkan di halaman ini."
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] tabular-nums">
              {qTrim ? `${shown} / ${total}` : `${total}`} pemain
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]/40">
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] sm:px-6"
              >
                Nama
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] sm:px-6"
              >
                Kontak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70">
            {shown === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-14 text-center sm:px-6">
                  <p className="font-medium text-[var(--foreground)]">Tidak ada hasil</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Coba kata kunci lain untuk nama atau kontak.
                  </p>
                  {qTrim ? (
                    <button
                      type="button"
                      className="mt-4 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                      onClick={() => setQuery("")}
                    >
                      Hapus pencarian
                    </button>
                  ) : null}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-[var(--surface-hover)]/40"
                >
                  <td className="max-w-[200px] px-4 py-3.5 align-middle font-medium text-[var(--foreground)] sm:max-w-none sm:px-6 sm:py-4">
                    <span className="line-clamp-2 sm:line-clamp-none">{p.name}</span>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-[var(--muted)] sm:px-6 sm:py-4">
                    <span className="break-words">{p.contact.trim() || "—"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
