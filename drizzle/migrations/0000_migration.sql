CREATE TABLE public.booking_requests (
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
GRANT INSERT ON public.booking_requests TO anon, authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a request" ON public.booking_requests FOR INSERT TO anon, authenticated WITH CHECK (true);