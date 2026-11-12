import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getBooking } from "@/lib/booking.functions";
import { fmt12, usd } from "@/lib/slots";
import { PayPalCheckout } from "@/components/booking/PayPalCheckout";
import { whatsappLink } from "@/lib/site";

const q = (id: string) => queryOptions({ queryKey: ["booking", id], queryFn: () => getBooking({ data: { id } }) });

export const Route = createFileRoute("/booking/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(q(params.id)),
  head: () => ({ meta: [{ title: "Your Booking — Styled By Whitney" }, { name: "description", content: "Check the status of your appointment with Whitney." }, { property: "og:title", content: "Your Booking — Styled By Whitney" }, { property: "og:description", content: "Appointment status." }, { name: "robots", content: "noindex" }] }),
  component: BookingPage,
});

const label: Record<string, [string, string]> = {
  confirmed: ["Confirmed 💜", "Your payment was received and your appointment is confirmed. Whitney will send you the location."],
  awaiting_payment: ["Awaiting payment", "Your time is saved but not confirmed until payment is received."],
  payment_failed: ["Payment failed", "Your payment didn't go through. You can try again below or book a new time."],
  cancelled: ["Cancelled", "This booking was cancelled or the payment time ran out. Please book a new time."],
  completed: ["Completed", "Thank you for visiting Whitney!"],
};

function BookingPage() {
  const { id } = Route.useParams();
  const { data, refetch } = useSuspenseQuery(q(id));
  const b = data.booking;
  if (!b) return <section className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-4xl">Booking not found</h1><Link to="/book" className="btn-primary mt-6 inline-block">Book an appointment</Link></section>;
  const [title, text] = label[b.status];
  const wa = whatsappLink(`Hi Whitney! I'm ${b.customer_name}, about my booking for ${b.service_name} on ${b.appointment_date} at ${fmt12(b.start_time)}.`);
  return (
    <section className="mx-auto max-w-xl px-5 py-24">
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="eyebrow">Booking status</p>
        <h1 className="mt-2 text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{text}</p>
        <dl className="mt-6 space-y-2 text-left text-sm">
          {[["Service", b.service_name], ["Date", new Date(`${b.appointment_date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })], ["Time", `${fmt12(b.start_time)} – ${fmt12(b.end_time)}`], ["Price", usd(b.price_cents)]].map(([k, v]) => <div key={k} className="flex justify-between border-b border-border py-2"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {(b.status === "awaiting_payment" || b.status === "payment_failed") && data.paypalReady && b.status === "awaiting_payment" && <div className="mt-6"><PayPalCheckout bookingId={b.id} onDone={() => refetch()} /></div>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-outline">Message Whitney</a>}
          {(b.status === "cancelled" || b.status === "payment_failed") && <Link to="/book" className="btn-primary">Book a new time</Link>}
        </div>
      </div>
    </section>
  );
}
