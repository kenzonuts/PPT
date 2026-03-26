import type { Player, Team, TeamMember, TournamentState } from "@/lib/types";
import type { ValorantRank } from "@/lib/types";

/** Baris dari RPC public.get_live_roster */
export type LiveRosterRow = {
  membership_id: string | null;
  team_id: string;
  team_name: string;
  team_created_at: string;
  player_id: string | null;
  player_name: string | null;
  riot_id: string | null;
  rank: string | null;
};

const STUB = "1970-01-01T00:00:34.567Z";

export function mapLiveRosterToState(rows: LiveRosterRow[] | null): TournamentState {
  if (!rows?.length) {
    return { players: [], teams: [], team_members: [] };
  }

  const teamsById = new Map<string, Team>();
  const playersById = new Map<string, Player>();
  const teamMembers: TeamMember[] = [];

  for (const r of rows) {
    if (!teamsById.has(r.team_id)) {
      teamsById.set(r.team_id, {
        id: r.team_id,
        name: r.team_name,
        created_at: r.team_created_at,
      });
    }

    if (r.player_id && r.membership_id) {
      if (!playersById.has(r.player_id)) {
        playersById.set(r.player_id, {
          id: r.player_id,
          name: r.player_name ?? "",
          riot_id: r.riot_id ?? "",
          rank: (r.rank as ValorantRank) || "Iron",
          contact: "",
          availability: "",
          notes: "",
          created_at: STUB,
        });
      }
      teamMembers.push({
        id: r.membership_id,
        team_id: r.team_id,
        player_id: r.player_id,
      });
    }
  }

  return {
    teams: [...teamsById.values()],
    players: [...playersById.values()],
    team_members: teamMembers,
  };
}
