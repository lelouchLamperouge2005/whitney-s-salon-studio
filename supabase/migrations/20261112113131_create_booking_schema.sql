/*
# Create booking, payment and admin schema

Plain English: sets up everything the salon booking system stores. Services and prices, weekly opening hours, blocked dates, customer appointments, PayPal payment records, the contact/enquiry form inbox, and admin roles.

1. New Tables
- booking_requests: contact form messages (insert-only from the website).
- user_roles: which signed-in accounts are admins. Used by has_role().
- services: salon services with name, category, description, price in cents, duration and active flag.
- availability_rules: opening hours per weekday, with an optional break.
- blocked_dates: closed days and holidays.
- appointments: customer bookings with status, time slot and hold expiry.
- payments: one row per PayPal order, with amount, currency, capture reference and status.

2. Security
- RLS is enabled on every table.
- Anyone can read active services and opening hours. Blocked dates are public so the calendar can grey them out.
- Customers never read appointments or payments directly. Bookings and payments are written by server code using the service role.
- Admins (checked with has_role) can read and update appointments, read payments, and manage services, hours and blocked dates.
- Each operation has its own policy. No FOR ALL policies.
- has_role and the admin trigger function are not callable by anonymous visitors.

3. Integrity
- Overlapping active bookings are rejected by an exclusion constraint.
- A payment can be captured only once per appointment, and each PayPal capture id is unique.

4. Notes
- Full price is paid upfront. There are no deposit or balance columns.
- The admin account gets the admin role automatically when it signs up.
*/

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE public.appointment_status AS ENUM ('awaiting_payment', 'confirmed', 'payment_failed', 'cancelled', 'completed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'booking',
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  service text,
  preferred_date date,
  preferred_time text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kind_chk CHECK (kind IN ('booking','contact')),
  CONSTRAINT name_len CHECK (char_length(full_name) BETWEEN 1 AND 100),
  CONSTRAINT phone_len CHECK (char_length(phone) BETWEEN 5 AND 30),
  CONSTRAINT email_len CHECK (email IS NULL OR char_length(email) <= 255),
  CONSTRAINT service_len CHECK (service IS NULL OR char_length(service) <= 100),
  CONSTRAINT time_len CHECK (preferred_time IS NULL OR char_length(preferred_time) <= 20),
  CONSTRAINT msg_len CHECK (message IS NULL OR char_length(message) <= 1000)
);
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.booking_requests TO anon, authenticated;
DROP POLICY IF EXISTS "Anyone can submit a request" ON public.booking_requests;
CREATE POLICY "Anyone can submit a request" ON public.booking_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'stellaigogo08@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.grant_owner_admin() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 720),
  image_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
DROP POLICY IF EXISTS "Anyone reads active services" ON public.services;
CREATE POLICY "Anyone reads active services" ON public.services FOR SELECT TO anon, authenticated USING (active);
DROP POLICY IF EXISTS "Admins read all services" ON public.services;
CREATE POLICY "Admins read all services" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins insert services" ON public.services;
CREATE POLICY "Admins insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update services" ON public.services;
CREATE POLICY "Admins update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete services" ON public.services;
CREATE POLICY "Admins delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.availability_rules (
  weekday smallint PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT true,
  open_time time NOT NULL DEFAULT '13:00',
  close_time time NOT NULL DEFAULT '18:00',
  break_start time,
  break_end time,
  CHECK (close_time > open_time),
  CHECK ((break_start IS NULL) = (break_end IS NULL))
);
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.availability_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.availability_rules TO authenticated;
GRANT ALL ON public.availability_rules TO service_role;
DROP POLICY IF EXISTS "Anyone reads hours" ON public.availability_rules;
CREATE POLICY "Anyone reads hours" ON public.availability_rules FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins insert hours" ON public.availability_rules;
CREATE POLICY "Admins insert hours" ON public.availability_rules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update hours" ON public.availability_rules;
CREATE POLICY "Admins update hours" ON public.availability_rules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete hours" ON public.availability_rules;
CREATE POLICY "Admins delete hours" ON public.availability_rules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL UNIQUE,
  reason text
);
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blocked_dates TO authenticated;
GRANT ALL ON public.blocked_dates TO service_role;
DROP POLICY IF EXISTS "Anyone reads blocked dates" ON public.blocked_dates;
CREATE POLICY "Anyone reads blocked dates" ON public.blocked_dates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins insert blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins insert blocked dates" ON public.blocked_dates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins update blocked dates" ON public.blocked_dates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins delete blocked dates" ON public.blocked_dates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  notes text,
  status public.appointment_status NOT NULL DEFAULT 'awaiting_payment',
  hold_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
    tsrange(appointment_date + start_time, appointment_date + end_time) WITH &&
  ) WHERE (status IN ('awaiting_payment', 'confirmed', 'completed'))
);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments (appointment_date);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
DROP POLICY IF EXISTS "Admins read appointments" ON public.appointments;
CREATE POLICY "Admins read appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update appointments" ON public.appointments;
CREATE POLICY "Admins update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'paypal',
  paypal_order_id text UNIQUE,
  paypal_capture_id text,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_appointment_idx ON public.payments (appointment_id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_capture_per_appointment ON public.payments (appointment_id) WHERE status = 'captured';
CREATE UNIQUE INDEX IF NOT EXISTS payments_capture_id_key ON public.payments (paypal_capture_id) WHERE paypal_capture_id IS NOT NULL;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
DROP POLICY IF EXISTS "Admins read payments" ON public.payments;
CREATE POLICY "Admins read payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
