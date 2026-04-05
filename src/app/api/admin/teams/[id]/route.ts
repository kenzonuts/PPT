import { insertAdminAuditLog } from "@/lib/admin-audit";
import { getAdminActor, isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const admin = createSupabaseAdminClient();
    const { data: before, error: beforeErr } = await admin
      .from("teams")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (beforeErr) throw beforeErr;

    const { error } = await admin.from("teams").delete().eq("id", id);
    if (error) throw error;

    await insertAdminAuditLog(admin, actor, {
      action: "delete_team",
      entity_type: "team",
      entity_id: id,
      changes: { removed: before ?? { id } },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal menghapus tim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
