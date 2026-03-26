import type { ValorantRank } from "./types";

/** Aksen visual per tier — muted, tanpa glow berlebihan. */
export const RANK_VISUAL: Record<
  ValorantRank,
  { stripe: string; selectedRing: string; hint?: string }
> = {
  Iron: {
    stripe: "bg-[#6B7280]",
    selectedRing: "ring-[#9CA3AF]/50",
  },
  Bronze: {
    stripe: "bg-[#A67C52]",
    selectedRing: "ring-[#C4956A]/45",
  },
  Silver: {
    stripe: "bg-[#9CA8B8]",
    selectedRing: "ring-[#B8C4D4]/50",
  },
  Gold: {
    stripe: "bg-[#C9A227]",
    selectedRing: "ring-[#E3BC3A]/45",
  },
  Platinum: {
    stripe: "bg-[#4A9D96]",
    selectedRing: "ring-[#5FB5AD]/45",
  },
  Diamond: {
    stripe: "bg-[#5B7FD1]",
    selectedRing: "ring-[#7C9AE8]/45",
  },
  Ascendant: {
    stripe: "bg-[#C7509A]",
    selectedRing: "ring-[#E06EB5]/40",
  },
  Immortal: {
    stripe: "bg-[#C84B4B]",
    selectedRing: "ring-[#E06B6B]/45",
  },
  Radiant: {
    stripe: "bg-[#E8C96D]",
    selectedRing: "ring-[#F5DF93]/50",
  },
};

export const RANK_GROUPS: { title: string; ranks: ValorantRank[] }[] = [
  { title: "Entry", ranks: ["Iron", "Bronze", "Silver", "Gold"] },
  { title: "Advanced", ranks: ["Platinum", "Diamond", "Ascendant"] },
  { title: "Elite", ranks: ["Immortal", "Radiant"] },
];
