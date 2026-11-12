import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { PageHero } from "@/components/site/PageHero";
import { PayPalCheckout } from "@/components/booking/PayPalCheckout";
import { getBookingSetup, getSlots, createBooking } from "@/lib/booking.functions";
import { fmt12, paymentSplit, usd } from "@/lib/slots";

const setupQuery = queryOptions({ queryKey: ["booking-setup"], queryFn: () => getBookingSetup() });

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { service?: string } =>
    typeof s["service"] === "string" ? { service: (s["service"] as string).slice(0, 100) } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(setupQuery),
  head: () => ({
    meta: [
      { title: "Book an Appointment — Styled By Whitney" },
      { name: "description", content: "Pick a style, choose a free time and pay securely with PayPal to book Whitney." },
      { property: "og:title", content: "Book an Appointment — Styled By Whitney" },
      { property: "og:description", content: "Choose your style, date and time and book with Whitney." },
    ],
  }),
  component: Book,
});

const steps = ["Service", "Date & time", "Your details", "Summary", "Payment"];
const field = "w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";
const details = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(30).regex(/^[+\d\s()-]+$/, "Please enter a valid phone number"),
  notes: z.string().trim().max(1000),
});

function Book() {
  const { service: pre } = Route.useSearch();
  const { data: setup } = useSuspenseQuery(setupQuery);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(() => setup.services.find((s) => s.name === pre)?.id ?? null);
  const [day, setDay] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [info, setInfo] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const slotsFn = useServerFn(getSlots);
  const bookFn = useServerFn(createBooking);

  const svc = setup.services.find((s) => s.id === serviceId);
  const date = day ? format(day, "yyyy-MM-dd") : null;
  const slots = useQuery({ queryKey: ["slots", serviceId, date], enabled: !!serviceId && !!date, queryFn: () => slotsFn({ data: { serviceId: serviceId!, date: date! } }) });
  const blocked = useMemo(() => new Set(setup.blockedDates), [setup.blockedDates]);
  const categories = [...new Set(setup.services.map((s) => s.category))];

  async function reserve() {
    setBusy(true); setSubmitErr(null);
    const r = await bookFn({ data: { serviceId: serviceId!, date: date!, time: time!, ...info } }).catch(() => ({ error: "Something went wrong. Please try again." }));
    setBusy(false);
    if ("error" in r && r.error) { setSubmitErr(r.error); if (r.error.includes("taken")) { setTime(null); setStep(1); slots.refetch(); } return; }
    if ("id" in r && r.id) { setBookingId(r.id); setStep(4); }
  }

  return (
    <>
      <PageHero eyebrow="Book" title="Book Your Appointment" text="Choose your style, pick a free time and pay securely to lock in your spot." />
      <section className="mx-auto max-w-4xl px-5 py-12">
        <ol className="mb-8 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
          {steps.map((s, i) => <li key={s} className={`rounded-full border px-3 py-1 ${i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{i + 1}. {s}</li>)}
        </ol>
        <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl border border-border bg-card p-6 md:p-8">
          {step === 0 && (
            <div className="space-y-8">
              {categories.map((c) => (
                <div key={c}><h2 className="text-3xl">{c}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {setup.services.filter((s) => s.category === c).map((s) => (
                      <button key={s.id} onClick={() => { setServiceId(s.id); setTime(null); }} className={`rounded-xl border p-4 text-left transition ${serviceId === s.id ? "border-primary bg-primary/10 ring-2 ring-ring/40" : "border-border hover:border-primary/60"}`}>
                        <div className="flex justify-between gap-3"><span className="font-semibold">{s.name}</span><span className="text-primary">{usd(s.price_cents)}</span></div>
                        <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">About {s.duration_minutes >= 60 ? `${+(s.duration_minutes / 60).toFixed(1)} hr` : `${s.duration_minutes} min`}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end"><button className="btn-primary disabled:opacity-50" disabled={!svc} onClick={() => setStep(1)}>Continue</button></div>
            </div>
          )}
          {step === 1 && svc && (
            <div className="grid gap-6 md:grid-cols-2">
              <Calendar mode="single" selected={day} onSelect={(d) => { setDay(d); setTime(null); }} className="rounded-xl border border-border"
                disabled={(d) => { const k = format(d, "yyyy-MM-dd"); return k < setup.today || setup.closedWeekdays.includes(d.getDay()) || blocked.has(k); }} />
              <div>
                <h3 className="text-2xl">{date ? format(day!, "EEEE, MMMM d") : "Pick a date"}</h3>
                <p className="text-sm text-muted-foreground">{svc.name} · {usd(svc.price_cents)}</p>
                {date && slots.isLoading && <p className="mt-4 text-sm text-muted-foreground">Checking free times…</p>}
                {date && slots.data && slots.data.slots.length === 0 && <p className="mt-4 rounded-xl bg-muted p-4 text-sm">No appointments available on this day. Please try another date.</p>}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {slots.data?.slots.map((t) => <button key={t} onClick={() => setTime(t)} className={`rounded-lg border px-2 py-2 text-sm transition ${time === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{fmt12(t)}</button>)}
                </div>
              </div>
              <div className="flex justify-between md:col-span-2"><button className="btn-outline" onClick={() => setStep(0)}>Back</button><button className="btn-primary disabled:opacity-50" disabled={!time} onClick={() => setStep(2)}>Continue</button></div>
            </div>
          )}
          {step === 2 && (
            <form noValidate className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const p = details.safeParse(info); if (!p.success) { const x: Record<string, string> = {}; p.error.issues.forEach((i) => (x[i.path[0] as string] = i.message)); setErrs(x); return; } setErrs({}); setInfo(p.data); setStep(3); }}>
              {(["name", "email", "phone"] as const).map((k) => (
                <div key={k} className={k === "name" ? "md:col-span-2" : ""}>
                  <label className="mb-1 block text-sm">{{ name: "Full name", email: "Email address", phone: "Phone number" }[k]} *</label>
                  <input className={field} value={info[k]} maxLength={k === "email" ? 255 : 100} type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} autoComplete={k === "name" ? "name" : k === "email" ? "email" : "tel"} onChange={(e) => setInfo({ ...info, [k]: e.target.value })} />
                  {errs[k] && <p className="mt-1 text-xs text-destructive">{errs[k]}</p>}
                </div>
              ))}
              <div className="md:col-span-2"><label className="mb-1 block text-sm">Notes (optional)</label><textarea className={field} rows={3} maxLength={1000} value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} placeholder="Length, colour, hair included or not…" /></div>
              <div className="flex justify-between md:col-span-2"><button type="button" className="btn-outline" onClick={() => setStep(1)}>Back</button><button type="submit" className="btn-primary">Review booking</button></div>
            </form>
          )}
          {step === 3 && svc && date && time && (
            <div>
              <h2 className="text-3xl">Booking summary</h2>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                {[["Service", svc.name], ["Price", usd(svc.price_cents)], ["Date", format(day!, "EEEE, MMMM d, yyyy")], ["Time", fmt12(time)], ["Name", info.name], ["Email", info.email], ["Phone", info.phone], ["Notes", info.notes || "—"],
                  ["Due now (full price)", usd(paymentSplit(svc.price_cents).dueNow)], ["Remaining balance", usd(paymentSplit(svc.price_cents).balance)]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-muted p-3"><dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt><dd className="mt-1">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">All prices in USD. The address is shared once your booking is confirmed.</p>
              {submitErr && <p className="mt-4 text-sm text-destructive">{submitErr}</p>}
              <div className="mt-6 flex justify-between"><button className="btn-outline" onClick={() => setStep(2)}>Back</button><button className="btn-primary disabled:opacity-60" disabled={busy} onClick={reserve}>{busy ? "Saving…" : "Continue to payment"}</button></div>
            </div>
          )}
          {step === 4 && bookingId && svc && (
            <div className="mx-auto max-w-md text-center">
              <h2 className="text-3xl">Pay {usd(svc.price_cents)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{setup.paypalReady ? "Your time is held for 15 minutes while you pay." : ""}</p>
              <div className="mt-6"><PayPalCheckout bookingId={bookingId} onDone={() => navigate({ to: "/booking/$id", params: { id: bookingId } })} /></div>
              <button className="btn-outline mt-6" onClick={() => navigate({ to: "/booking/$id", params: { id: bookingId } })}>View my booking</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
