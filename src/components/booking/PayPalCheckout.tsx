import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createPaypalOrder, capturePaypalOrder } from "@/lib/booking.functions";

declare global { interface Window { paypal?: any } }

export function PayPalCheckout({ bookingId, onDone }: { bookingId: string; onDone: (r: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const create = useServerFn(createPaypalOrder);
  const capture = useServerFn(capturePaypalOrder);
  const clientId = import.meta.env.VITE_LOVABLE_CONNECTOR_PAYPAL_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId || !ref.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.paypal || !ref.current) return;
      ref.current.innerHTML = "";
      window.paypal.Buttons({
        style: { color: "black", shape: "pill", label: "pay" },
        createOrder: async () => (await create({ data: { id: bookingId } })).orderId,
        onApprove: async (d: { orderID: string }) => onDone((await capture({ data: { orderId: d.orderID } })).result),
        onError: () => setErr("PayPal couldn't complete the payment. Please try again."),
      }).render(ref.current);
    };
    const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing && window.paypal) render();
    else { const s = existing ?? Object.assign(document.createElement("script"), { src, async: true }); s.addEventListener("load", render); if (!existing) document.body.appendChild(s); }
    return () => { cancelled = true; };
  }, [clientId, bookingId]);

  if (!clientId) return <p className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">Online payment is being set up. Your time is saved as <strong>awaiting payment</strong> — Whitney will contact you to arrange payment and confirm.</p>;
  return <div>{err && <p className="mb-3 text-sm text-destructive">{err}</p>}<div ref={ref} /></div>;
}
