import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/site";

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow text-center">Good to know</p>
      <h2 className="mt-3 text-center text-4xl md:text-5xl">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`f${i}`} className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
