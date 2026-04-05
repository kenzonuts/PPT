"use client";

import { isAdminSessionCookiePresent } from "@/lib/auth-mock";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  mapLiveRosterToState,
  type LiveRosterRow,
} from "@/lib/supabase/live-roster";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Player, Team, TournamentState } from "@/lib/types";

const emptyState = (): TournamentState => ({
  players: [],
  teams: [],
  team_members: [],
});

type TournamentContextValue = {
  state: TournamentState;
  hydrated: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  registerPlayer: (
    input: Omit<Player, "id" | "created_at">
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  createTeam: (name: string) => Promise<void>;
  assignPlayerToTeam: (playerId: string, teamId: string | null) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  updatePlayer: (
    playerId: string,
    fields: { name: string; riot_id: string }
  ) => Promise<void>;
  getTeamForPlayer: (playerId: string) => Team | null;
  getPlayersByTeam: (teamId: string) => Player[];
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

async function fetchAdminState(): Promise<TournamentState> {
  const res = await fetch("/api/admin/state", { credentials: "include" });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? `Gagal memuat data admin (${res.status})`);
  }
  return res.json() as Promise<TournamentState>;
}

async function fetchPublicState(): Promise<TournamentState> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_live_roster");
  if (error) throw new Error(error.message);
  return mapLiveRosterToState(data as LiveRosterRow[] | null);
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TournamentState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoadError(null);
      const next = isAdminSessionCookiePresent()
        ? await fetchAdminState()
        : await fetchPublicState();
      setState(next);
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : "Gagal memuat data");
      setState(emptyState());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const registerPlayer = useCallback(
    async (input: Omit<Player, "id" | "created_at">) => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from("players").insert({
          name: input.name.trim(),
          riot_id: input.riot_id.trim(),
          rank: input.rank,
          contact: input.contact.trim(),
          notes: input.notes.trim(),
        });
        if (error) {
          if (error.code === "23505") {
            return { ok: false as const, error: "Riot ID ini sudah terdaftar." };
          }
          return { ok: false as const, error: error.message };
        }
        await refresh();
        return { ok: true as const };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal mendaftar";
        return { ok: false as const, error: msg };
      }
    },
    [refresh]
  );

  const createTeam = useCallback(
    async (name: string) => {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal membuat tim");
      }
      await refresh();
    },
    [refresh]
  );

  const assignPlayerToTeamFn = useCallback(
    async (playerId: string, teamId: string | null) => {
      const res = await fetch("/api/admin/assign", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId, team_id: teamId }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal mengubah tim");
      }
      await refresh();
    },
    [refresh]
  );

  const deleteTeamFn = useCallback(
    async (teamId: string) => {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal menghapus tim");
      }
      await refresh();
    },
    [refresh]
  );

  const deletePlayerFn = useCallback(
    async (playerId: string) => {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal menghapus peserta");
      }
      await refresh();
    },
    [refresh]
  );

  const updatePlayerFn = useCallback(
    async (playerId: string, fields: { name: string; riot_id: string }) => {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          riot_id: fields.riot_id.trim(),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal memperbarui peserta");
      }
      await refresh();
    },
    [refresh]
  );

  const getTeamForPlayer = useCallback(
    (playerId: string): Team | null => {
      const member = state.team_members.find((m) => m.player_id === playerId);
      if (!member) return null;
      return state.teams.find((t) => t.id === member.team_id) ?? null;
    },
    [state.team_members, state.teams]
  );

  const getPlayersByTeam = useCallback(
    (teamId: string): Player[] => {
      const ids = new Set(
        state.team_members.filter((m) => m.team_id === teamId).map((m) => m.player_id)
      );
      return state.players.filter((p) => ids.has(p.id));
    },
    [state.players, state.team_members]
  );

  const value = useMemo(
    () => ({
      state,
      hydrated,
      loadError,
      refresh,
      registerPlayer,
      createTeam,
      assignPlayerToTeam: assignPlayerToTeamFn,
      deleteTeam: deleteTeamFn,
      deletePlayer: deletePlayerFn,
      updatePlayer: updatePlayerFn,
      getTeamForPlayer,
      getPlayersByTeam,
    }),
    [
      state,
      hydrated,
      loadError,
      refresh,
      registerPlayer,
      createTeam,
      assignPlayerToTeamFn,
      deleteTeamFn,
      deletePlayerFn,
      updatePlayerFn,
      getTeamForPlayer,
      getPlayersByTeam,
    ]
  );

  return (
    <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
  );
}

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return ctx;
}
