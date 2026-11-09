import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

// Fades in page blocks as they scroll into view. Runs after hydration only.
export function ScrollReveal() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("main section > *, main section .grid > *, footer > div > *"),
    ).filter((el) => !el.dataset.revealed);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el, i) => {
      el.dataset.revealed = "1";
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already visible: leave as is
      el.classList.add("reveal");
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [path]);
  return null;
}
