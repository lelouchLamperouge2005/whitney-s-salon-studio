import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/paypal/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) return new Response("Webhook not configured", { status: 503 });
        const raw = await request.text();
        let event: any;
        try { event = JSON.parse(raw); } catch { return new Response("Bad request", { status: 400 }); }
        const h = (k: string) => request.headers.get(k);
        const { paypal } = await import("@/lib/paypal.server");
        try {
          const v = await paypal("/v1/notifications/verify-webhook-signature", { method: "POST", body: JSON.stringify({
            auth_algo: h("paypal-auth-algo"), cert_url: h("paypal-cert-url"), transmission_id: h("paypal-transmission-id"),
            transmission_sig: h("paypal-transmission-sig"), transmission_time: h("paypal-transmission-time"), webhook_id: webhookId, webhook_event: event }) });
          if (v.verification_status !== "SUCCESS") return new Response(null, { status: 400 });
        } catch { return new Response(null, { status: 400 }); }
        const orderId = event?.resource?.supplementary_data?.related_ids?.order_id;
        if (orderId && typeof event.event_type === "string" && event.event_type.startsWith("PAYMENT.CAPTURE.")) {
          const { settleOrder } = await import("@/lib/booking.functions");
          await settleOrder(orderId, event.resource);
        }
        return new Response("ok");
      },
    },
  },
});
