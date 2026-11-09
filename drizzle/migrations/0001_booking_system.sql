CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'stellaigogo08@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_grant_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

CREATE TABLE public.services (
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
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active services" ON public.services FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.availability_rules (
  weekday smallint PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT true,
  open_time time NOT NULL DEFAULT '13:00',
  close_time time NOT NULL DEFAULT '18:00',
  break_start time,
  break_end time,
  CHECK (close_time > open_time)
);
GRANT SELECT ON public.availability_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.availability_rules TO authenticated;
GRANT ALL ON public.availability_rules TO service_role;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads hours" ON public.availability_rules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage hours" ON public.availability_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL UNIQUE,
  reason text
);
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blocked_dates TO authenticated;
GRANT ALL ON public.blocked_dates TO service_role;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads blocked dates" ON public.blocked_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage blocked dates" ON public.blocked_dates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TYPE public.appointment_status AS ENUM ('awaiting_payment', 'confirmed', 'payment_failed', 'cancelled', 'completed');

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  price_cents integer NOT NULL,
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
GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'paypal',
  paypal_order_id text UNIQUE,
  paypal_capture_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.availability_rules (weekday, is_open, open_time, close_time)
SELECT d, true, '13:00', '18:00' FROM generate_series(0, 6) d;

INSERT INTO public.services (name, category, description, price_cents, duration_minutes, sort_order) VALUES
('Colour Twists', 'Braids & Twists', 'Neat parted twists with a pop of colour blended through for a playful, fresh finish.', 9000, 180, 1),
('Kinky Twists (Shoulder Length)', 'Braids & Twists', 'Soft, textured twists with fluffy ends — lightweight and full of movement.', 10000, 180, 2),
('Boho Knotless Braids', 'Braids & Twists', 'Knotless braids with curly pieces left loose for that dreamy, boho look.', 15000, 300, 3),
('Extra-Long Boho Twists', 'Braids & Twists', 'Waist-length twists with curly ends — a statement style that turns heads.', 18000, 360, 4),
('Wig Install', 'Wigs', 'Secure, natural-looking wig installation on your own unit.', 6000, 60, 5),
('Wig Install & Styling', 'Wigs', 'Installation plus curls, waves or a sleek finish styled to suit you.', 9000, 90, 6),
('Wig Styling Only', 'Wigs', 'Refresh a wig you already own with a wash, curl or straight style.', 4000, 60, 7),
('Classic Manicure', 'Nails', 'Shaping, cuticle care and a polish of your choice.', 2500, 45, 8),
('Gel Manicure', 'Nails', 'Long-lasting, glossy gel colour that stays chip-free for weeks.', 3500, 60, 9);