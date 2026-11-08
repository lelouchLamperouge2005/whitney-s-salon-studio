import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { gallery } from "@/lib/site";
import { CtaBand, PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Our Work — Styled By Whitney" },
      { name: "description", content: "A gallery of real twists and braids styled by Whitney." },
      { property: "og:title", content: "Our Work — Styled By Whitney" },
      { property: "og:description", content: "Real twists and braids styled by Whitney." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const cats = ["All", ...new Set(gallery.map((g) => g.category))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<(typeof gallery)[number] | null>(null);
  const items = cat === "All" ? gallery : gallery.filter((g) => g.category === cat);
  return (
    <>
      <PageHero eyebrow="Our work" title="Real styles, real clients" text="Every photo here is Whitney's own work." />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={c === cat ? "btn-primary" : "btn-outline"}>{c}</button>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((g) => (
            <button key={g.src} onClick={() => setOpen(g)} className="group overflow-hidden rounded-2xl" aria-label={`View ${g.alt}`}>
              <img src={g.src} alt={g.alt} loading="lazy" className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105" />
            </button>
          ))}
        </div>
      </section>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl border-border bg-background p-2">
          <DialogTitle className="sr-only">{open?.alt}</DialogTitle>
          {open && <img src={open.src} alt={open.alt} className="max-h-[85vh] w-full rounded-xl object-contain" />}
        </DialogContent>
      </Dialog>
      <CtaBand />
    </>
  );
}
