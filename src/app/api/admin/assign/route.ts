import { insertAdminAuditLog } from "@/lib/admin-audit";
import { getAdminActor, isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { player_id?: string; team_id?: string | null };
    const playerId = body.player_id?.trim();
    if (!playerId) {
      return NextResponse.json({ error: "player_id wajib" }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();

    const { data: memberRow } = await admin
      .from("team_members")
      .select("team_id")
      .eq("player_id", playerId)
      .maybeSingle();
    const oldTeamId = memberRow?.team_id ?? null;

    const { data: playerRow } = await admin
      .from("players")
      .select("id, name, riot_id")
      .eq("id", playerId)
      .maybeSingle();

    const rawTeamId = body.team_id;
    const teamId =
      typeof rawTeamId === "string" && rawTeamId.trim().length > 0 ? rawTeamId.trim() : null;

    async function teamLabel(tid: string | null): Promise<string | null> {
      if (!tid) return null;
      const { data: t } = await admin.from("teams").select("name").eq("id", tid).maybeSingle();
      return t?.name ?? null;
    }

    const [oldName, newName] = await Promise.all([teamLabel(oldTeamId), teamLabel(teamId)]);

    const { error: delErr } = await admin.from("team_members").delete().eq("player_id", playerId);
    if (delErr) throw delErr;

    if (teamId && teamId.length > 0) {
      const { error: insErr } = await admin
        .from("team_members")
        .insert({ team_id: teamId, player_id: playerId });
      if (insErr) throw insErr;
    }

    const teamChanged = oldTeamId !== teamId;
    if (teamChanged) {
      await insertAdminAuditLog(admin, actor, {
        action: "assign_player",
        entity_type: "team_member",
        entity_id: playerId,
        changes: {
          player: playerRow ?? { id: playerId },
          team_id: { from: oldTeamId, to: teamId },
          team_name: { from: oldName, to: newName },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal mengubah penugasan";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
