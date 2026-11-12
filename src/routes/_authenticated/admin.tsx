import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { checkAdmin, getAdminData, setAppointmentStatus, saveService, saveHours, addBlockedDate, removeBlockedDate } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { fmt12, usd } from "@/lib/slots";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Styled By Whitney" }, { name: "description", content: "Manage bookings." }, { property: "og:title", content: "Admin — Styled By Whitney" }, { property: "og:description", content: "Manage bookings." }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const inp = "rounded-lg border border-input bg-muted px-2 py-1 text-sm";

function Admin() {
  const qc = useQueryClient();
  const isAdminFn = useServerFn(checkAdmin); const dataFn = useServerFn(getAdminData);
  const statusFn = useServerFn(setAppointmentStatus); const svcFn = useServerFn(saveService);
  const hoursFn = useServerFn(saveHours); const addB = useServerFn(addBlockedDate); const rmB = useServerFn(removeBlockedDate);
  const role = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const d = useQuery({ queryKey: ["admin"], enabled: !!role.data?.isAdmin, queryFn: () => dataFn() });
  const [tab, setTab] = useState("Appointments");
  const [block, setBlock] = useState({ date: "", reason: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const run = async (p: Promise<unknown>) => { try { await p; refresh(); } catch (e) { alert((e as Error).message); } };

  if (role.isLoading) return <p className="p-24 text-center">Loading…</p>;
  if (!role.data?.isAdmin) return <p className="p-24 text-center">This account doesn't have owner access.</p>;
  const x = d.data;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex items-center justify-between"><h1 className="text-4xl">Whitney's Admin</h1><button className="btn-outline" onClick={async () => { qc.clear(); await supabase.auth.signOut(); window.location.replace("/auth"); }}>Sign out</button></div>
      <div className="mt-6 flex flex-wrap gap-2">{["Appointments", "Services", "Availability", "Payments"].map((t) => <button key={t} onClick={() => setTab(t)} className={tab === t ? "btn-primary" : "btn-outline"}>{t}</button>)}</div>
      {!x ? <p className="mt-8">Loading…</p> : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card p-4 text-sm">
          {tab === "Appointments" && <table className="w-full"><tbody>{x.appointments.map((a) => (
            <tr key={a.id} className="border-b border-border align-top"><td className="p-2">{a.appointment_date}<br />{fmt12(a.start_time)}–{fmt12(a.end_time)}</td><td className="p-2">{a.service_name}<br />{usd(a.price_cents)}</td>
              <td className="p-2">{a.customer_name}<br />{a.customer_phone}<br />{a.customer_email}{a.notes && <><br /><em>{a.notes}</em></>}</td><td className="p-2 uppercase">{a.status.replace("_", " ")}</td>
              <td className="p-2 space-x-1">{(["confirmed", "completed", "cancelled"] as const).map((s) => <button key={s} className="btn-outline !px-2 !py-1 text-xs" onClick={() => run(statusFn({ data: { id: a.id, status: s } }))}>{s}</button>)}</td></tr>))}
            {x.appointments.length === 0 && <tr><td className="p-4">No appointments yet.</td></tr>}</tbody></table>}
          {tab === "Services" && <div className="space-y-2">{[...x.services, { id: undefined, name: "", category: "", description: "", price_cents: 0, duration_minutes: 60, active: true, sort_order: 99 }].map((s, i) => <ServiceRow key={s.id ?? `new${i}`} s={s} onSave={(v) => run(svcFn({ data: v }))} />)}</div>}
          {tab === "Availability" && <div className="space-y-4">
            <HoursEditor rules={x.rules} onSave={(r) => run(hoursFn({ data: r }))} />
            <h3 className="text-2xl">Blocked dates</h3>
            <div className="flex gap-2"><input type="date" className={inp} value={block.date} onChange={(e) => setBlock({ ...block, date: e.target.value })} /><input className={inp} placeholder="Reason" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} /><button className="btn-primary !py-1" disabled={!block.date} onClick={() => run(addB({ data: block }))}>Block</button></div>
            <ul>{x.blocked.map((b) => <li key={b.id} className="flex gap-3 py-1">{b.blocked_date} {b.reason}<button className="text-destructive" onClick={() => run(rmB({ data: { id: b.id } }))}>remove</button></li>)}</ul>
          </div>}
          {tab === "Payments" && <table className="w-full"><tbody>{x.payments.map((p) => <tr key={p.id} className="border-b border-border"><td className="p-2">{new Date(p.created_at).toLocaleString()}</td><td className="p-2">{usd(p.amount_cents)}</td><td className="p-2 uppercase">{p.status}</td><td className="p-2">{p.paypal_order_id}</td></tr>)}{x.payments.length === 0 && <tr><td className="p-4">No payments yet.</td></tr>}</tbody></table>}
        </div>)}
    </section>
  );
}

type Svc = { id?: string; name: string; category: string; description: string; price_cents: number; duration_minutes: number; active: boolean; sort_order: number };
function ServiceRow({ s, onSave }: { s: Svc; onSave: (v: Svc) => void }) {
  const [v, setV] = useState<Svc>({ id: s.id, name: s.name, category: s.category, description: s.description, price_cents: s.price_cents, duration_minutes: s.duration_minutes, active: s.active, sort_order: s.sort_order });
  return <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
    <input className={inp} placeholder="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
    <input className={inp} placeholder="Category" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} />
    <input className={`${inp} flex-1`} placeholder="Description" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
    $<input className={`${inp} w-20`} type="number" value={v.price_cents / 100} onChange={(e) => setV({ ...v, price_cents: Math.round(Number(e.target.value) * 100) })} />
    <input className={`${inp} w-20`} type="number" value={v.duration_minutes} onChange={(e) => setV({ ...v, duration_minutes: Number(e.target.value) })} />min
    <label><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> shown</label>
    <button className="btn-primary !py-1" disabled={!v.name} onClick={() => onSave(v)}>{v.id ? "Save" : "Add"}</button>
  </div>;
}

type Rule = { weekday: number; is_open: boolean; open_time: string; close_time: string; break_start: string | null; break_end: string | null };
function HoursEditor({ rules, onSave }: { rules: Rule[]; onSave: (r: Rule[]) => void }) {
  const [r, setR] = useState(rules.map((x) => ({ ...x, open_time: x.open_time.slice(0, 5), close_time: x.close_time.slice(0, 5), break_start: x.break_start?.slice(0, 5) ?? null, break_end: x.break_end?.slice(0, 5) ?? null })));
  const up = (i: number, p: Partial<Rule>) => setR(r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return <div><h3 className="text-2xl">Weekly hours</h3>{r.map((x, i) => <div key={x.weekday} className="flex flex-wrap items-center gap-2 py-1">
    <span className="w-10">{days[x.weekday]}</span><label><input type="checkbox" checked={x.is_open} onChange={(e) => up(i, { is_open: e.target.checked })} /> open</label>
    <input type="time" className={inp} value={x.open_time} onChange={(e) => up(i, { open_time: e.target.value })} />–<input type="time" className={inp} value={x.close_time} onChange={(e) => up(i, { close_time: e.target.value })} />
    break <input type="time" className={inp} value={x.break_start ?? ""} onChange={(e) => up(i, { break_start: e.target.value || null })} />–<input type="time" className={inp} value={x.break_end ?? ""} onChange={(e) => up(i, { break_end: e.target.value || null })} />
  </div>)}<button className="btn-primary mt-2" onClick={() => onSave(r)}>Save hours</button></div>;
}
