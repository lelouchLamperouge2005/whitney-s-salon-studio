// Pure scheduling helpers (salon local time). Times are minutes after midnight.
export type DayRule = { is_open: boolean; open_time: string; close_time: string; break_start: string | null; break_end: string | null };
export type Busy = { start: number; end: number };

export const SALON_TZ = "America/New_York";
export const SLOT_STEP = 30;

export const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
export const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const fmt12 = (t: string) => { const m = toMin(t); const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
export const usd = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

/** Full price is due upfront: deposit equals the price, balance is zero. */
export function paymentSplit(priceCents: number) { return { dueNow: priceCents, balance: 0 }; }

/** Current date (YYYY-MM-DD) and minute-of-day in the salon's time zone. */
export function salonNow(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: SALON_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

export function generateSlots(o: { date: string; rule: DayRule | undefined; blocked: boolean; duration: number; busy: Busy[]; now: { date: string; minutes: number }; step?: number }): string[] {
  const { date, rule, blocked, duration, busy, now, step = SLOT_STEP } = o;
  if (!rule || !rule.is_open || blocked || date < now.date) return [];
  const open = toMin(rule.open_time), close = toMin(rule.close_time);
  const blocks: Busy[] = [...busy];
  if (rule.break_start && rule.break_end) blocks.push({ start: toMin(rule.break_start), end: toMin(rule.break_end) });
  const out: string[] = [];
  for (let s = open; s + duration <= close; s += step) {
    if (date === now.date && s <= now.minutes) continue;
    const e = s + duration;
    if (blocks.some((b) => s < b.end && b.start < e)) continue;
    out.push(toHHMM(s));
  }
  return out;
}
