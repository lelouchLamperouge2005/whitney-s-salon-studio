/*
# Seed services and weekly opening hours

Plain English: fills the salon's service menu and weekly hours with the existing prices and times from the website, so the booking page works straight away. The owner can change any of it from the admin dashboard.

1. Services
- Seven services with the prices and durations already listed on the site (no new prices added).
- Each row is only inserted if a service with the same name does not already exist, so re-running this changes nothing.

2. Opening hours
- Every day of the week opens 1:00 PM to 6:00 PM by default, matching the current booking rules.

3. Security
- No table or policy changes. Existing row level security applies.

4. Notes
- Prices are in US cents (for example 9000 = $90.00).
*/

INSERT INTO public.availability_rules (weekday, is_open, open_time, close_time)
SELECT d, true, TIME '13:00', TIME '18:00'
FROM generate_series(0, 6) AS d
ON CONFLICT (weekday) DO NOTHING;

INSERT INTO public.services (name, category, description, price_cents, duration_minutes, sort_order)
SELECT v.name, v.category, v.description, v.price_cents, v.duration_minutes, v.sort_order
FROM (VALUES
  ('Colour Twists', 'Braids & Twists', 'Twists with colour, styled to your preference.', 9000, 180, 1),
  ('Box Braids', 'Braids & Twists', 'Classic box braids in your chosen length and size.', 10000, 180, 2),
  ('Knotless Braids', 'Braids & Twists', 'Lightweight knotless braids for a natural, comfortable finish.', 15000, 300, 3),
  ('Goddess Braids', 'Braids & Twists', 'Full, statement goddess braids.', 18000, 360, 4),
  ('Wig Installation', 'Wigs', 'Wig fitting, install and styling.', 6000, 60, 5),
  ('Wig Customisation', 'Wigs', 'Custom parting, tinting and styling for your wig.', 9000, 90, 6),
  ('Wig Styling Only', 'Wigs', 'Styling for a wig you already own.', 4000, 60, 7)
) AS v(name, category, description, price_cents, duration_minutes, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.name = v.name);
