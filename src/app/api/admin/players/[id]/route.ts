import { insertAdminAuditLog } from "@/lib/admin-audit";
import { getAdminActor, isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
  const playerId = id.trim();
  try {
    const body = (await request.json()) as { name?: unknown; riot_id?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const riot_id = typeof body.riot_id === "string" ? body.riot_id.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }
    if (!riot_id) {
      return NextResponse.json({ error: "Riot ID tidak boleh kosong" }, { status: 400 });
    }
    if (!riot_id.includes("#")) {
      return NextResponse.json(
        {
          error:
            "Riot ID harus memuat tanda # (contoh: Nama#tag), sesuai yang di game.",
        },
        { status: 400 }
      );
    }
    const admin = createSupabaseAdminClient();
    const { data: before, error: beforeErr } = await admin
      .from("players")
      .select("id, name, riot_id")
      .eq("id", playerId)
      .maybeSingle();
    if (beforeErr) throw beforeErr;

    const { data, error } = await admin
      .from("players")
      .update({ name, riot_id })
      .eq("id", playerId)
      .select("id, name, riot_id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Riot ID ini sudah dipakai peserta lain." },
          { status: 409 }
        );
      }
      throw error;
    }

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (before) {
      if (before.name !== name) changes.name = { from: before.name, to: name };
      if (before.riot_id !== riot_id) changes.riot_id = { from: before.riot_id, to: riot_id };
    }
    if (Object.keys(changes).length > 0) {
      await insertAdminAuditLog(admin, actor, {
        action: "update_player",
        entity_type: "player",
        entity_id: playerId,
        changes,
      });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal memperbarui peserta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
  const playerId = id.trim();
  try {
    const admin = createSupabaseAdminClient();
    const { data: before, error: beforeErr } = await admin
      .from("players")
      .select("id, name, riot_id, rank")
      .eq("id", playerId)
      .maybeSingle();
    if (beforeErr) throw beforeErr;

    const { error } = await admin.from("players").delete().eq("id", playerId);
    if (error) throw error;

    await insertAdminAuditLog(admin, actor, {
      action: "delete_player",
      entity_type: "player",
      entity_id: playerId,
      changes: { removed: before ?? { id: playerId } },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal menghapus peserta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
