import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminActor = { email: string; displayName: string };

export type AdminAuditEntry = {
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown>;
};

/** Menyisipkan log; gagal insert tidak membatalkan operasi utama. */
export async function insertAdminAuditLog(
  admin: SupabaseClient,
  actor: AdminActor,
  entry: AdminAuditEntry,
): Promise<void> {
  const { error } = await admin.from("admin_audit_logs").insert({
    actor_email: actor.email,
    actor_display_name: actor.displayName,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    changes: entry.changes,
  });
  if (error) console.error("[admin_audit]", error.message);
}
