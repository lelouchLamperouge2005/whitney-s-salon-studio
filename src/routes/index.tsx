import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Palette, Scissors, Sparkles } from "lucide-react";
import { images, gallery, reviews, services } from "@/lib/site";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CtaBand } from "@/components/site/PageHero";
import { Faq } from "@/components/site/Faq";
import { ReviewCards } from "@/components/site/ReviewCards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Styled By Whitney — Braids, Twists & Wigs " },
      { name: "description", content: "Where beauty meets confidence. Book braids, twists, wig installs and manicures with Whitney." },
      { property: "og:title", content: "Styled By Whitney — Where Beauty Meets Confidence" },
      { property: "og:description", content: "Book braids, twists, wig installs and manicures with Whitney." },
    ],
  }),
  component: Home,
});

const why = [
  { icon: Scissors, title: "Neat, careful work", text: "Clean parts and tidy finishes on every style." },
  { icon: Palette, title: "Creative colour", text: "Colour blends and boho touches that make your look yours." },
  { icon: Heart, title: "Personal attention", text: "One stylist, one client at a time — you're never rushed." },
  { icon: Sparkles, title: "Passion for hair", text: "Whitney loves what she does, and it shows." },
];

function Home() {
  return (
    <>
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <img src={images.w3} alt="Long boho knotless braids by Whitney" className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-fade-overlay absolute inset-0" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20">
          <p className="eyebrow animate-rise">Styled By Whitney</p>
          <h1 className="animate-rise mt-4 max-w-2xl text-6xl leading-[1.02] md:text-8xl">Where Beauty Meets <em className="text-primary">Confidence.</em></h1>
          <p className="animate-rise mt-6 max-w-lg text-muted-foreground">
            Discover your style. Embrace your beauty. Experience the art of professional hairstyling with Styled By Whitney.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap gap-3">
            <Link to="/book" className="btn-primary">Book Your Appointment</Link>
            <Link to="/services" className="btn-outline">Explore Our Services</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2">
        <img src={images.w4} alt="Extra-long honey blonde boho twists" loading="lazy" className="aspect-[4/5] w-full rounded-3xl object-cover" />
        <div>
          <p className="eyebrow">Welcome</p>
          <h2 className="mt-3 text-5xl">Hair that makes you feel like you.</h2>
          <p className="mt-5 text-muted-foreground">
            Styled By Whitney is a hair and beauty business built on passion. From colourful twists to long boho braids,
            wig installs and manicures, every appointment is about leaving you looking good and feeling confident.
          </p>
          <p className="mt-4 text-muted-foreground">
            Expect a relaxed, friendly experience, careful attention to detail and a style made around what you want.
          </p>
          <Link to="/about" className="btn-outline mt-8 inline-block">Our Story</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Services</p>
            <h2 className="mt-3 text-5xl">Featured Styles</h2>
          </div>
          <Link to="/services" className="btn-outline">All Services & Prices</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.filter((s) => s.image).map((s) => <ServiceCard key={s.name} s={s} />)}
        </div>
      </section>

      <section className="bg-royal-gradient mt-16 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">Why choose us</p>
          <h2 className="mt-3 text-center text-5xl">Made with care</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border bg-background/40 p-6">
                <w.icon className="text-primary" />
                <h3 className="mt-4 text-2xl">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <p className="eyebrow text-center">Our work</p>
        <h2 className="mt-3 text-center text-5xl">Fresh From The Chair</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {gallery.map((g) => (
            <img key={g.src} src={g.src} alt={g.alt} loading="lazy" className="aspect-[3/4] w-full rounded-2xl object-cover transition duration-500 hover:scale-[1.02]" />
          ))}
        </div>
        <div className="mt-10 text-center"><Link to="/gallery" className="btn-outline">View Full Gallery</Link></div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <p className="eyebrow">Meet the stylist</p>
          <h2 className="mt-3 text-5xl">Hi, I'm Whitney.</h2>
          <p className="mt-5 text-muted-foreground">
            I'm the hands and heart behind Styled By Whitney. I started this business because I love doing hair — braids,
            twists, colour and everything in between. My goal is simple: every client should leave feeling beautiful and confident.
          </p>
          <Link to="/about" className="btn-primary mt-8 inline-block">Meet Whitney</Link>
        </div>
        <img src={images.portrait} alt="Whitney, founder and stylist of Styled By Whitney" loading="lazy" className="order-1 aspect-[4/5] w-full rounded-3xl object-cover object-top md:order-2" />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow text-center">Kind words</p>
        <h2 className="mt-3 text-center text-5xl">What Clients Say</h2>
        <div className="mt-10"><ReviewCards items={reviews.slice(0, 3)} /></div>
      </section>

      <Faq />
      <CtaBand />
    </>
  );
}
