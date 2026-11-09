# Booking + PayPal system for Styled By Whitney

## Decisions (from your answers)
- Clients pay the **full price upfront** through PayPal to confirm a booking.
- Default working hours: **every day, 1pm to 6pm**. Whitney can change days, hours, breaks and blocked dates in her admin page.
- Admin sign-in: **stellaigogo08@gmail.com** (only this account gets admin access).
- PayPal: Whitney's PayPal Business account is connected through the secure PayPal connector (a connect card appears during the build).

## About your separate database
This site already has its own built-in backend switched on, and all booking data will live there. Moving to the outside database you made isn't something I can switch to from here, and you don't need it. Everything below works with the built-in one.

## Client booking flow (/book, rebuilt as 5 steps)
1. **Service**: cards with name, description, price (USD) and length, loaded from the services list Whitney manages.
2. **Date and time**: a calendar that greys out past days, closed days and blocked dates. It only shows free time slots, based on her hours, breaks, the length of the service and bookings already made. If a day is full, it says "No appointments available."
3. **Your details**: name, email and phone (all required), plus optional notes. Fields are checked before moving on.
4. **Summary**: service, price, date and time, your details, the amount due now (the full price) and the balance left ($0).
5. **Pay with PayPal**: the official PayPal buttons. The booking is held as "Awaiting payment" for 15 minutes. It becomes "Confirmed" only after the server checks the payment with PayPal.
- **Confirmation page** (/booking/$id): shows Confirmed, Awaiting payment, Payment failed or Cancelled. The address is still never shown, in line with your rule.

## Whitney's admin area (/admin, sign-in required)
- **Appointments**: list and calendar view with client details and payment status. She can confirm, mark completed or cancel.
- **Services**: add or edit services, prices and lengths. Existing services are copied in as the starting list, with the same prices as today.
- **Availability**: weekly hours, breaks and blocked dates or holidays.
- **Payments**: amount, PayPal reference and status for each booking.

## Kept as is
Design, all other pages, the WhatsApp, Instagram and contact links, and the contact form. No shop or cart.

## Technical details
- Tables: services, availability_rules (weekday, open/close times, break), blocked_dates, appointments (status enum: awaiting_payment, confirmed, payment_failed, cancelled, completed; plus starts_at/ends_at), payments, user_roles + has_role(). Customer info is stored on the appointment.
- Double bookings are blocked by an exclusion constraint (btree_gist) on the time range for active bookings, and slots are re-checked on the server when a hold is created. Holds that go unpaid expire.
- RLS: anyone can read active services and the hours rules. Free slots are worked out by a server function without exposing other clients' details. Bookings are created only through server functions; admin reads and writes are checked with has_role('admin').
- PayPal: server functions create the order (amount taken from the database, never from the browser) and capture it through the connector gateway. A verified webhook at /api/public/paypal/webhook covers late or failed captures.
- Auth: email/password sign-in for admin; an admin role is given automatically when stellaigogo08@gmail.com signs up.
- Tests: slot generation (1pm–6pm, service length, breaks, past dates) and the "full price due upfront" rule.

## Still needed after the build
- Approve the PayPal connect card (use test mode first).
- Whitney signs up once with her admin email.
