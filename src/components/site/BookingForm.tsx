import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { services, whatsappLink } from "@/lib/site";

const schema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().min(5, "Please enter a valid phone number").max(30).regex(/^[+\d\s()-]+$/, "Please enter a valid phone number"),
  email: z.string().trim().max(255).email("Please enter a valid email").or(z.literal("")),
  service: z.string().max(100),
  preferred_date: z.string().max(20),
  preferred_time: z.string().max(20),
  message: z.string().trim().max(1000, "Message must be under 1000 characters"),
});

type Values = z.infer<typeof schema>;
const empty: Values = { full_name: "", phone: "", email: "", service: "", preferred_date: "", preferred_time: "", message: "" };

const field = "w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

export function BookingForm({ kind = "booking", defaultService = "" }: { kind?: "booking" | "contact"; defaultService?: string }) {
  const [values, setValues] = useState<Values>({ ...empty, service: defaultService });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [sent, setSent] = useState<Values | null>(null);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: typeof errors = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as keyof Values] = i.message));
      setErrors(errs);
      return;
    }
    if (kind === "booking" && !parsed.data.service) {
      setErrors({ service: "Please choose a service" });
      return;
    }
    setErrors({});
    setStatus("sending");
    const d = parsed.data;
    const { error } = await supabase.from("booking_requests").insert({
      kind,
      full_name: d.full_name,
      phone: d.phone,
      email: d.email || null,
      service: d.service || null,
      preferred_date: d.preferred_date || null,
      preferred_time: d.preferred_time || null,
      message: d.message || null,
    });
    if (error) {
      setStatus("error");
      return;
    }
    setSent(d);
    setStatus("done");
    setValues({ ...empty });
  }

  if (status === "done" && sent) {
    const wa = whatsappLink(
      `Hi Whitney! I'm ${sent.full_name}. I'd like to book ${sent.service || "an appointment"}${sent.preferred_date ? ` on ${sent.preferred_date}` : ""}${sent.preferred_time ? ` at ${sent.preferred_time}` : ""}.`,
    );
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h3 className="text-3xl">Request received 💜</h3>
        <p className="mt-3 text-muted-foreground">
          Thank you, {sent.full_name}! Your {kind === "booking" ? "appointment request" : "message"} has been sent. It isn't confirmed yet — Whitney will contact you to confirm{kind === "booking" ? " the time and share the location" : ""}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-primary">Also send on WhatsApp</a>}
          <button className="btn-outline" onClick={() => setStatus("idle")}>Send another</button>
        </div>
      </div>
    );
  }

  const Err = ({ k }: { k: keyof Values }) => (errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2 md:p-8">
      <div>
        <label className="mb-1 block text-sm">Full name *</label>
        <input className={field} value={values.full_name} onChange={set("full_name")} maxLength={100} autoComplete="name" />
        <Err k="full_name" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Phone number *</label>
        <input className={field} value={values.phone} onChange={set("phone")} maxLength={30} type="tel" autoComplete="tel" />
        <Err k="phone" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Email address</label>
        <input className={field} value={values.email} onChange={set("email")} maxLength={255} type="email" autoComplete="email" />
        <Err k="email" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Service {kind === "booking" ? "*" : "of interest"}</label>
        <select className={field} value={values.service} onChange={set("service")}>
          <option value="">Choose a service</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>{s.name} ({s.price})</option>
          ))}
        </select>
        <Err k="service" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Preferred date</label>
        <input className={field} value={values.preferred_date} onChange={set("preferred_date")} type="date" min={new Date().toISOString().slice(0, 10)} />
      </div>
      <div>
        <label className="mb-1 block text-sm">Preferred time</label>
        <input className={field} value={values.preferred_time} onChange={set("preferred_time")} type="time" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm">{kind === "booking" ? "Additional notes" : "Message"}</label>
        <textarea className={field} rows={4} value={values.message} onChange={set("message")} maxLength={1000} placeholder="Length, colour, hair included or not…" />
        <Err k="message" />
      </div>
      {status === "error" && (
        <p className="md:col-span-2 text-sm text-destructive">Sorry, something went wrong sending your request. Please try again.</p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn-primary md:col-span-2 disabled:opacity-60">
        {status === "sending" ? "Sending…" : kind === "booking" ? "Request Appointment" : "Send Message"}
      </button>
    </form>
  );
}
