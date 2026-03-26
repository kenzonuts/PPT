import { isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const admin = createSupabaseAdminClient();
    const [playersRes, teamsRes, membersRes] = await Promise.all([
      admin.from("players").select("*").order("created_at", { ascending: true }),
      admin.from("teams").select("*").order("created_at", { ascending: true }),
      admin.from("team_members").select("*"),
    ]);
    if (playersRes.error) throw playersRes.error;
    if (teamsRes.error) throw teamsRes.error;
    if (membersRes.error) throw membersRes.error;

    return NextResponse.json({
      players: playersRes.data ?? [],
      teams: teamsRes.data ?? [],
      team_members: membersRes.data ?? [],
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal memuat data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
