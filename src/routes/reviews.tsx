import { createFileRoute, Link } from "@tanstack/react-router";
import { ReviewCards } from "@/components/site/ReviewCards";
import { CtaBand, PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Client Reviews — Styled By Whitney" },
      { name: "description", content: "What clients say about their styles from Styled By Whitney." },
      { property: "og:title", content: "Client Reviews — Styled By Whitney" },
      { property: "og:description", content: "What clients say about Styled By Whitney." },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  return (
    <>
      <PageHero eyebrow="Reviews" title="What Our Clients Say" />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <ReviewCards />
        <div className="mt-10 text-center">
          <Link to="/contact" className="btn-outline">Leave a Review</Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
