export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="bg-royal-gradient px-5 py-20 text-center md:py-28">
      <p className="eyebrow animate-rise">{eyebrow}</p>
      <h1 className="animate-rise mx-auto mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">{title}</h1>
      {text && <p className="animate-rise mx-auto mt-5 max-w-xl text-muted-foreground">{text}</p>}
    </section>
  );
}

export function CtaBand() {
  return null;
}
