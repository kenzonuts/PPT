"use client";

import { TournamentProvider } from "@/context/tournament-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <TournamentProvider>{children}</TournamentProvider>;
}
