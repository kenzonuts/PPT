import { isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("players").delete().eq("id", id.trim());
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal menghapus peserta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
