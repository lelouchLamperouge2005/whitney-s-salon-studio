import { Star } from "lucide-react";
import { reviews } from "@/lib/site";

export function ReviewCards({ items = reviews }: { items?: typeof reviews }) {
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="font-display text-2xl">Reviews coming soon</p>
        <p className="mt-2 text-sm text-muted-foreground">Been styled by Whitney? We'd love to hear about your experience.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((r, i) => (
        <figure key={i} className="rounded-2xl border border-border bg-card p-6">
          <div className="flex gap-1 text-primary">
            {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
          </div>
          <blockquote className="mt-4 font-display text-xl italic">“{r.text}”</blockquote>
          <figcaption className="mt-4 text-sm text-muted-foreground">{r.name}{r.date ? ` · ${r.date}` : ""}</figcaption>
        </figure>
      ))}
    </div>
  );
}
