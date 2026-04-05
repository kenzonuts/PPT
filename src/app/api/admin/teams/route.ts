import { insertAdminAuditLog } from "@/lib/admin-audit";
import { getAdminActor, isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { name?: string };
    const name = (body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nama tim wajib diisi" }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("teams").insert({ name }).select("*").single();
    if (error) throw error;

    await insertAdminAuditLog(admin, actor, {
      action: "create_team",
      entity_type: "team",
      entity_id: data.id,
      changes: { name: { from: null, to: name } },
    });

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal membuat tim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
