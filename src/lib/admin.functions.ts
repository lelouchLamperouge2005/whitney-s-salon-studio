import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const authed = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]);

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const checkAdmin = authed.handler(async ({ context }) => {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  return { isAdmin: !!data };
});

export const getAdminData = authed.handler(async ({ context }) => {
  await assertAdmin(context);
  const s = context.supabase;
  const [a, p, sv, r, b] = await Promise.all([
    s.from("appointments").select("*").order("appointment_date", { ascending: false }).order("start_time").limit(500),
    s.from("payments").select("*").order("created_at", { ascending: false }).limit(500),
    s.from("services").select("*").order("sort_order"),
    s.from("availability_rules").select("*").order("weekday"),
    s.from("blocked_dates").select("*").order("blocked_date"),
  ]);
  return { appointments: a.data ?? [], payments: p.data ?? [], services: sv.data ?? [], rules: r.data ?? [], blocked: b.data ?? [] };
});

export const setAppointmentStatus = authed
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["confirmed", "cancelled", "completed"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("appointments").update({ status: data.status, hold_expires_at: null }).eq("id", data.id);
    if (error) throw new Error(error.code === "23P01" ? "That time now overlaps another booking." : "Update failed");
    return { ok: true };
  });

const svcSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(1).max(100), category: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500), price_cents: z.number().int().min(0).max(1_000_000),
  duration_minutes: z.number().int().min(5).max(720), active: z.boolean(), sort_order: z.number().int().min(0).max(1000),
});
export const saveService = authed.inputValidator((d: unknown) => svcSchema.parse(d)).handler(async ({ data, context }) => {
  await assertAdmin(context);
  const { id, ...rest } = data;
  const { error } = id ? await context.supabase.from("services").update(rest).eq("id", id) : await context.supabase.from("services").insert(rest);
  if (error) throw new Error("Could not save service");
  return { ok: true };
});

const t = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
export const saveHours = authed
  .inputValidator((d: unknown) => z.array(z.object({ weekday: z.number().int().min(0).max(6), is_open: z.boolean(), open_time: t, close_time: t, break_start: t.nullable(), break_end: t.nullable() })).max(7).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("availability_rules").upsert(data);
    if (error) throw new Error("Could not save hours (closing time must be after opening time)");
    return { ok: true };
  });

export const addBlockedDate = authed
  .inputValidator((d: unknown) => z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().trim().max(100) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("blocked_dates").upsert({ blocked_date: data.date, reason: data.reason || null }, { onConflict: "blocked_date" });
    if (error) throw new Error("Could not block date");
    return { ok: true };
  });
export const removeBlockedDate = authed
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("blocked_dates").delete().eq("id", data.id);
    return { ok: true };
  });
