import { describe, it, expect } from "vitest";
import { generateSlots, paymentSplit } from "./slots";
const rule = { is_open: true, open_time: "13:00", close_time: "18:00", break_start: null, break_end: null };
const now = { date: "2026-01-01", minutes: 0 };
describe("slots", () => {
  it("only offers starts between 1pm and 6pm that finish by 6pm", () => {
    const s = generateSlots({ date: "2026-02-01", rule, blocked: false, duration: 60, busy: [], now });
    expect(s[0]).toBe("13:00"); expect(s.at(-1)).toBe("17:00");
  });
  it("a 6-hour service does not fit in 1pm-6pm", () => {
    expect(generateSlots({ date: "2026-02-01", rule, blocked: false, duration: 360, busy: [], now })).toEqual([]);
  });
  it("skips booked time and breaks", () => {
    const s = generateSlots({ date: "2026-02-01", rule: { ...rule, break_start: "15:00", break_end: "15:30" }, blocked: false, duration: 60, busy: [{ start: 13 * 60, end: 14 * 60 }], now });
    expect(s).not.toContain("13:00"); expect(s).not.toContain("14:30"); expect(s).toContain("14:00");
  });
  it("no slots on past days or blocked days", () => {
    expect(generateSlots({ date: "2025-12-31", rule, blocked: false, duration: 60, busy: [], now })).toEqual([]);
    expect(generateSlots({ date: "2026-02-01", rule, blocked: true, duration: 60, busy: [], now })).toEqual([]);
  });
  it("full price is due upfront", () => { expect(paymentSplit(9000)).toEqual({ dueNow: 9000, balance: 0 }); });
});
