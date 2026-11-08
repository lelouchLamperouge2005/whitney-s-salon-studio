import { createFileRoute, Link } from "@tanstack/react-router";
import { contact, whatsappLink } from "@/lib/site";
import { BookingForm } from "@/components/site/BookingForm";
import { PageHero } from "@/components/site/PageHero";
import { Faq } from "@/components/site/Faq";

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
          <Info label="Phone" value={contact.phone} />
          <Info label="Email" value={contact.email} />
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
