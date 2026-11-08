import { createFileRoute } from "@tanstack/react-router";
import { BookingForm } from "@/components/site/BookingForm";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { service?: string } =>
    typeof s.service === "string" ? { service: s.service.slice(0, 100) } : {},
  head: () => ({
    meta: [
      { title: "Book an Appointment — Styled By Whitney" },
      { name: "description", content: "Request an appointment for braids, twists, wigs or nails with Whitney." },
      { property: "og:title", content: "Book an Appointment — Styled By Whitney" },
      { property: "og:description", content: "Request an appointment with Whitney." },
    ],
  }),
  component: Book,
});

function Book() {
  const { service } = Route.useSearch();
  return (
    <>
      <PageHero eyebrow="Book" title="Request Your Appointment" text="Send your request and Whitney will reach out to confirm the time and share the location." />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <BookingForm key={service} kind="booking" defaultService={service ?? ""} />
      </section>
    </>
  );
}
