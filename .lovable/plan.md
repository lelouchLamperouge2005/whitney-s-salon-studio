# Styled By Whitney — Salon Website Plan

Building starts only after you send Whitney's work photos and her portrait (as you asked). Approving this plan just locks in the direction.

## Look and feel
- Purple and black luxury theme using your exact colours (#32104F, #210B32, #663399, #B99AD9, #E8DDF2, #0B090D, #F8F5FA).
- Elegant serif headings (Cormorant Garamond) with a clean body font (Karla), rounded corners, soft fades on scroll.
- Layout inspired by the reference screenshots, but with Whitney's own identity.
- Phone-first design (most visitors will be on phones), sticky top menu with a hamburger on mobile and a "Book Appointment" button always visible.

## Pages
1. Home — big photo with "Where Beauty Meets Confidence", intro, featured services, why choose us, featured work, Meet Whitney, reviews, final "Your Next Look Starts Here" banner.
2. Services — grouped by category, each with photo, description, price, duration and a Book button.
3. About — story, mission and values, large founder section for Whitney (written warmly for a young first-time business owner, no invented qualifications).
4. Our Work — photo gallery with category filters and tap-to-enlarge viewing.
5. Reviews — review cards with stars (only real reviews; empty-state until you send some).
6. Contact — phone, WhatsApp, email, socials, hours, and a message form.
7. Location — address, map, Get Directions button, hours.
- Plus a Book page, an FAQ accordion, and a footer on every page.

## Booking and messages
- Booking and contact forms check entries and show clear success/error messages.
- Each request is saved so Whitney can see every booking (via Lovable Cloud), and also offers a "Send on WhatsApp" button that opens a pre-filled chat with her.
- The confirmation says "request received", never "appointment confirmed".

## What I still need from you
- Photos of Whitney's work (labelled by style if possible) and a portrait of Whitney.
- Services with prices (and durations if known).
- Phone, WhatsApp number, email, Instagram/TikTok links.
- Address or Google Maps link, and business hours.
- Whitney's short story/bio and any real client reviews.
- Any booking rules (deposits, cancellations).
Anything missing will show as a clearly marked placeholder, never made-up info.

## Technical details
- Separate route per page with its own titles/descriptions.
- Cloud table for booking/contact submissions, insert from server function, no public read.
- Photos uploaded as hosted assets; gallery data in one editable file.
