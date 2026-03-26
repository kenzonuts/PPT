import { isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { player_id?: string; team_id?: string | null };
    const playerId = body.player_id?.trim();
    if (!playerId) {
      return NextResponse.json({ error: "player_id wajib" }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();

    const { error: delErr } = await admin.from("team_members").delete().eq("player_id", playerId);
    if (delErr) throw delErr;

    const teamId = body.team_id;
    if (teamId && teamId.length > 0) {
      const { error: insErr } = await admin
        .from("team_members")
        .insert({ team_id: teamId, player_id: playerId });
      if (insErr) throw insErr;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal mengubah penugasan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
