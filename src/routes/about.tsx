import { createFileRoute } from "@tanstack/react-router";
import { images } from "@/lib/site";
import { CtaBand, PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Whitney — Styled By Whitney" },
      { name: "description", content: "Meet Whitney, the young stylist behind Styled By Whitney, and the story of her business." },
      { property: "og:title", content: "About Whitney — Styled By Whitney" },
      { property: "og:description", content: "Meet Whitney, the young stylist behind Styled By Whitney." },
    ],
  }),
  component: About,
});

const values = ["Beauty", "Confidence", "Creativity", "Professionalism", "Individual expression", "Happy clients"];

function About() {
  return (
    <>
      <PageHero eyebrow="Our story" title="A passion turned into a business" />
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-lg text-muted-foreground">
          Styled By Whitney began with a love for doing hair. What started as styling for friends and family grew into a
          business with one mission: helping every client look beautiful and feel confident. Each style is done with patience,
          care and a creative eye — and every client is treated like the only one in the chair.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2">
        <img src="/work-6.jpg" alt="Portrait of Whitney, founder of Styled By Whitney" className="aspect-[4/5] w-full rounded-3xl object-cover object-top shadow-glow" />
        <div>
          <p className="eyebrow">Meet the founder</p>
          <h2 className="mt-3 text-6xl">Whitney</h2>
          <p className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">Founder & Stylist</p>
          <p className="mt-6 text-muted-foreground">
            Whitney is a young, self-driven stylist with a big love for hair. Styled By Whitney is her first business, and
            she pours her heart into every appointment.
          </p>
          <p className="mt-4 text-muted-foreground">
            Her specialities include colour twists, kinky twists, boho knotless braids and long boho twists, plus wig
            installs and manicures. She loves experimenting with colour and texture to create looks that feel personal.
          </p>
          <p className="mt-4 text-muted-foreground">
            Her vision: to grow Styled By Whitney into a go-to name for beautiful, confident hair — one happy client at a time.
          </p>
        </div>
      </section>

      <section className="bg-royal-gradient px-5 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow">Mission & values</p>
          <h2 className="mt-3 text-5xl">What we stand for</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {values.map((v) => (
              <span key={v} className="rounded-full border border-border bg-background/40 px-5 py-2 font-display text-xl">{v}</span>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
