import { isAdminRequest } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const MAX = 100;
const DEFAULT_LIMIT = 40;

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const raw = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(raw) ? Math.min(Math.max(1, Math.floor(raw)), MAX) : DEFAULT_LIMIT;

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("admin_audit_logs")
      .select("id, created_at, actor_display_name, actor_email, action, entity_type, entity_id, changes")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return NextResponse.json({ logs: data ?? [] });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Gagal memuat riwayat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
