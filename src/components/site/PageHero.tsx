import { Link } from "@tanstack/react-router";

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="bg-royal-gradient px-5 py-20 text-center md:py-28">
      <p className="eyebrow animate-rise">{eyebrow}</p>
      <h1 className="animate-rise mx-auto mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">{title}</h1>
      {text && <p className="animate-rise mx-auto mt-5 max-w-xl text-muted-foreground">{text}</p>}
    </section>
  );
}

export function CtaBand({ title = "Your Next Look Starts Here.", text = "Ready for a fresh new look? Let Styled By Whitney bring your vision to life." }: { title?: string; text?: string }) {
  return (
    <section className="px-5 py-16">
      <div className="bg-royal-gradient shadow-glow mx-auto max-w-5xl rounded-3xl border border-border px-6 py-16 text-center">
        <h2 className="text-4xl md:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">{text}</p>
        <Link to="/book" className="btn-primary mt-8 inline-block">Book Your Appointment</Link>
      </div>
    </section>
  );
}
