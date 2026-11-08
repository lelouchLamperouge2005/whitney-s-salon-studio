import { createFileRoute, Link } from "@tanstack/react-router";
import { services } from "@/lib/site";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CtaBand, PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Prices — Styled By Whitney" },
      { name: "description", content: "Twists, boho braids, wig installs and manicures with starting prices in USD." },
      { property: "og:title", content: "Services & Prices — Styled By Whitney" },
      { property: "og:description", content: "Twists, boho braids, wig installs and manicures with starting prices." },
    ],
  }),
  component: Services,
});

function Services() {
  const categories = [...new Set(services.map((s) => s.category))];
  return (
    <>
      <PageHero eyebrow="Services" title="Find Your Perfect Style" text="Starting prices in USD. Final price depends on length, size and whether hair is included — Whitney confirms it before your appointment." />
      {categories.map((c) => {
        const items = services.filter((s) => s.category === c);
        const withImg = items.filter((s) => s.image);
        const list = items.filter((s) => !s.image);
        return (
          <section key={c} className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="text-4xl md:text-5xl">{c}</h2>
            {withImg.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {withImg.map((s) => <ServiceCard key={s.name} s={s} />)}
              </div>
            )}
            {list.length > 0 && (
              <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
                {list.map((s) => (
                  <li key={s.name} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl">{s.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                      {s.duration && <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.duration}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="whitespace-nowrap font-semibold text-primary">{s.price}</span>
                      <Link to="/book" search={{ service: s.name }} className="btn-outline whitespace-nowrap">Book</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      <CtaBand title="Find Your Perfect Style." text="Book your appointment today." />
    </>
  );
}
