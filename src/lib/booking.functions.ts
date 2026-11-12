import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateSlots, salonNow, toMin, toHHMM, weekdayOf, type DayRule } from "./slots";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

async function expireHolds(db: Awaited<ReturnType<typeof admin>>) {
  await db.from("appointments").update({ status: "cancelled" }).eq("status", "awaiting_payment").lt("hold_expires_at", new Date().toISOString());
}

async function slotsFor(db: Awaited<ReturnType<typeof admin>>, date: string, duration: number) {
  const [{ data: rule }, { data: blocked }, { data: appts }] = await Promise.all([
    db.from("availability_rules").select("*").eq("weekday", weekdayOf(date)).maybeSingle(),
    db.from("blocked_dates").select("id").eq("blocked_date", date).maybeSingle(),
    db.from("appointments").select("start_time,end_time").eq("appointment_date", date).in("status", ["awaiting_payment", "confirmed", "completed"]),
  ]);
  return generateSlots({ date, rule: (rule ?? undefined) as DayRule | undefined, blocked: !!blocked, duration, busy: (appts ?? []).map((a) => ({ start: toMin(a.start_time), end: toMin(a.end_time) })), now: salonNow() });
}

export const getBookingSetup = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const [{ data: services }, { data: rules }, { data: blocked }] = await Promise.all([
    db.from("services").select("id,name,category,description,price_cents,duration_minutes,image_url").eq("active", true).order("sort_order"),
    db.from("availability_rules").select("weekday,is_open"),
    db.from("blocked_dates").select("blocked_date").gte("blocked_date", salonNow().date),
  ]);
  return {
    services: services ?? [],
    closedWeekdays: (rules ?? []).filter((r) => !r.is_open).map((r) => r.weekday),
    blockedDates: (blocked ?? []).map((b) => b.blocked_date),
    today: salonNow().date,
    paypalReady: Boolean(process.env['LOVABLE_API_KEY'] && process.env['PAYPAL_API_KEY']),
  };
});

export const getSlots = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ serviceId: z.string().uuid(), date: z.string().regex(dateRe) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await expireHolds(db);
    const { data: svc } = await db.from("services").select("duration_minutes").eq("id", data.serviceId).eq("active", true).maybeSingle();
    if (!svc) return { slots: [] as string[] };
    return { slots: await slotsFor(db, data.date, svc.duration_minutes) };
  });

const bookingSchema = z.object({
  serviceId: z.string().uuid(), date: z.string().regex(dateRe), time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(30).regex(/^[+\d\s()-]+$/), notes: z.string().trim().max(1000).optional().default(""),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await expireHolds(db);
    const { data: svc } = await db.from("services").select("*").eq("id", data.serviceId).eq("active", true).maybeSingle();
    if (!svc) return { error: "That service is no longer available." };
    const slots = await slotsFor(db, data.date, svc.duration_minutes);
    if (!slots.includes(data.time)) return { error: "Sorry, that time was just taken. Please pick another." };
    const ready = Boolean(process.env['LOVABLE_API_KEY'] && process.env['PAYPAL_API_KEY']);
    const { data: row, error } = await db.from("appointments").insert({
      service_id: svc.id, service_name: svc.name, price_cents: svc.price_cents, appointment_date: data.date,
      start_time: data.time, end_time: toHHMM(toMin(data.time) + svc.duration_minutes),
      customer_name: data.name, customer_email: data.email, customer_phone: data.phone, notes: data.notes || null,
      hold_expires_at: ready ? new Date(Date.now() + 15 * 60_000).toISOString() : null,
    }).select("id").single();
    if (error) {
      if (error.code === "23P01") return { error: "Sorry, that time was just taken. Please pick another." };
      console.error(error); return { error: "We couldn't save your booking. Please try again." };
    }
    return { id: row.id };
  });

export const getBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await expireHolds(db);
    const { data: a } = await db.from("appointments").select("id,service_name,price_cents,appointment_date,start_time,end_time,customer_name,status,hold_expires_at").eq("id", data.id).maybeSingle();
    return { booking: a, paypalReady: Boolean(process.env['LOVABLE_API_KEY'] && process.env['PAYPAL_API_KEY']) };
  });

export const createPaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { paypal } = await import("./paypal.server");
    const db = await admin();
    await expireHolds(db);
    const { data: a } = await db.from("appointments").select("*").eq("id", data.id).maybeSingle();
    if (!a || a.status !== "awaiting_payment") throw new Error("This booking can't be paid right now.");
    const order = await paypal("/v2/checkout/orders", {
      method: "POST", headers: { "PayPal-Request-Id": `order-${a.id}-${Date.now()}` },
      body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ reference_id: a.id, description: a.service_name.slice(0, 120), amount: { currency_code: "USD", value: (a.price_cents / 100).toFixed(2) } }] }),
    });
    await db.from("payments").insert({ appointment_id: a.id, paypal_order_id: order.id, amount_cents: a.price_cents, status: "created" });
    return { orderId: order.id as string };
  });

export async function settleOrder(orderId: string, capture: { status?: string; id?: string; amount?: { value?: string; currency_code?: string } } | undefined) {
  const db = await admin();
  const { data: pay } = await db.from("payments").select("*").eq("paypal_order_id", orderId).maybeSingle();
  if (!pay) return "unknown";
  const ok = capture?.status === "COMPLETED" && capture.amount?.currency_code === "USD" && Math.round(Number(capture.amount?.value) * 100) === pay.amount_cents;
  await db.from("payments").update({ status: ok ? "captured" : (capture?.status ?? "failed").toLowerCase(), paypal_capture_id: capture?.id ?? null, updated_at: new Date().toISOString() }).eq("id", pay.id);
  if (ok) await db.from("appointments").update({ status: "confirmed", hold_expires_at: null }).eq("id", pay.appointment_id).in("status", ["awaiting_payment", "payment_failed", "cancelled"]);
  else if (capture?.status !== "PENDING") await db.from("appointments").update({ status: "payment_failed" }).eq("id", pay.appointment_id).eq("status", "awaiting_payment");
  return ok ? "confirmed" : capture?.status === "PENDING" ? "pending" : "failed";
}

export const capturePaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ orderId: z.string().min(5).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { paypal } = await import("./paypal.server");
    let res: { purchase_units?: { payments?: { captures?: { status?: string; id?: string; amount?: { value?: string; currency_code?: string } }[] } }[] };
    try { res = await paypal(`/v2/checkout/orders/${encodeURIComponent(data.orderId)}/capture`, { method: "POST", headers: { "PayPal-Request-Id": `capture-${data.orderId}` } }); }
    catch { res = {}; }
    return { result: await settleOrder(data.orderId, res.purchase_units?.[0]?.payments?.captures?.[0]) };
  });
