import { isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }
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
    const { data, error } = await admin
      .from("players")
      .update({ name, riot_id })
      .eq("id", id.trim())
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
