import { Link } from "@tanstack/react-router";
import type { Service } from "@/lib/site";

export function ServiceCard({ s }: { s: Service }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-glow">
      {s.image && (
        <div className="aspect-[4/5] overflow-hidden">
          <img src={s.image} alt={s.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-2xl">{s.name}</h3>
          <span className="whitespace-nowrap text-sm font-semibold text-primary">{s.price}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
        {s.duration && <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.duration}</p>}
        <div className="mt-auto pt-5">
          <Link to="/book" search={{ service: s.name }} className="btn-outline inline-block">Book Now</Link>
        </div>
      </div>
    </article>
  );
}