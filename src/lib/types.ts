/**
 * Domain types — struktur ini dapat dipetakan langsung ke tabel Supabase:
 * players, teams, team_members
 */

export type ValorantRank =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Ascendant"
  | "Immortal"
  | "Radiant";

export const VALORANT_RANKS: ValorantRank[] = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Ascendant",
  "Immortal",
  "Radiant",
];

export interface Player {
  id: string;
  name: string;
  riot_id: string;
  rank: ValorantRank;
  contact: string;
  notes: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  player_id: string;
}

export interface TournamentState {
  players: Player[];
  teams: Team[];
  team_members: TeamMember[];
}
