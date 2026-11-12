# Project memory

## Product intent & audience

- Booking/appointment system for a service business offering 7 bookable services with weekly availability hours.
- Includes an admin dashboard for managing bookings/services.
- Customers book and pay online; PayPal is the payment provider.

## Brand personality & voice

- Not yet inferred from user-provided copy or design direction.

## Visual design & UX direction

- Frontend built with Vite + React.
- Existing booking page present; UI specifics not yet inferred.
- PayPal checkout flow intended via a new dedicated component.

## Decisions, constraints & rationale

- Database schema migrated on disk: booking tables, security/RLS rules, 7 services with weekly hours.
- Supabase likely used (edge functions referenced).
- Payment integration via PayPal; older PayPal code still exists and needs replacing with the new checkout component.
- Work was interrupted by usage limits; several file writes did not persist.

## Open questions & assumptions

- Missing files to recreate: edge functions, admin dashboard screens, new PayPal checkout component.
- Booking page may currently reference removed/missing functions — site may be broken.
- Need to confirm: Supabase as backend, exact edge function endpoints, admin dashboard requirements.
- Next planned step: rewrite missing files, then run build and tests.