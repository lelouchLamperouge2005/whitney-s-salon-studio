import { createFileRoute, Link } from "@tanstack/react-router";
import { contact, whatsappLink } from "@/lib/site";
import { BookingForm } from "@/components/site/BookingForm";
import { PageHero } from "@/components/site/PageHero";
import { Faq } from "@/components/site/Faq";
import { Instagram, MessageCircle, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Styled By Whitney" },
      { name: "description", content: "Get in touch with Whitney about a style, a question or a booking." },
      { property: "og:title", content: "Contact — Styled By Whitney" },
      { property: "og:description", content: "Get in touch with Whitney." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const wa = whatsappLink("Hi Whitney! I have a question about a style.");
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk hair" text="Questions, ideas, or a style you've been dreaming of — send a message." />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-3">
        <aside className="space-y-6">
          <div className="grid gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-glow">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span><span className="eyebrow block">WhatsApp</span><span className="text-sm">{contact.phone}</span></span>
              </a>
            )}
            <a href={contact.phoneHref} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-glow">
              <Phone className="h-6 w-6 text-primary" />
              <span><span className="eyebrow block">Call or text</span><span className="text-sm">{contact.phone}</span></span>
            </a>
            <a href={contact.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-glow">
              <Instagram className="h-6 w-6 text-primary" />
              <span><span className="eyebrow block">Instagram</span><span className="text-sm">{contact.instagramHandle}</span></span>
            </a>
          </div>
          <Info label="Location" value="Shared once your booking is accepted" />
          <div>
            <p className="eyebrow">Hours</p>
            {contact.hours.length ? (
              <ul className="mt-2 text-sm">{contact.hours.map((h) => <li key={h.day}>{h.day}: {h.time}</li>)}</ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">By appointment — hours coming soon</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-primary">Chat on WhatsApp</a>}
            <Link to="/book" className="btn-outline">Book Appointment</Link>
          </div>
        </aside>
        <div className="lg:col-span-2"><BookingForm kind="contact" /></div>
      </section>
      <Faq />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 text-sm ${value ? "" : "text-muted-foreground"}`}>{value || "Coming soon"}</p>
    </div>
  );
}
