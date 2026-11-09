import logo from "@/assets/logo.jpg.asset.json";
import portrait from "@/assets/portrait-black-background.jpg.asset.json";
import w1 from "@/assets/braids_1_topdown_blurred.jpg.asset.json";
import w2 from "@/assets/braids_2_side_blurred.jpg.asset.json";
import w3 from "@/assets/braids_3_store_blurred.jpg.asset.json";
import w4 from "@/assets/braids_4_outdoor_blurred.jpg.asset.json";

export const images = { logo: logo.url, portrait: portrait.url, w1: w1.url, w2: w2.url, w3: w3.url, w4: w4.url };

// PLACEHOLDER contact details: replace when the real ones are supplied.
export const contact = {
  phone: "+1 (803) 446-0941",
  phoneHref: "tel:+18034460941",
  whatsapp: "18034460941", // digits only, with country code
  email: "",
  instagram: "https://instagram.com/style_dbywhitney",
  instagramHandle: "@style_dbywhitney",
  tiktok: "",
  hours: [] as { day: string; time: string }[],
};

export type Service = {
  name: string;
  category: string;
  description: string;
  price: string;
  duration?: string;
  image?: string;
};

// Prices are estimates in USD, to be confirmed by Whitney.
export const services: Service[] = [
  { category: "Braids & Twists", name: "Colour Twists", description: "Neat parted twists with a pop of colour blended through for a playful, fresh finish.", price: "from $90", duration: "3–4 hrs", image: w1.url },
  { category: "Braids & Twists", name: "Kinky Twists (Shoulder Length)", description: "Soft, textured twists with fluffy ends — lightweight and full of movement.", price: "from $100", duration: "3–5 hrs", image: w2.url },
  { category: "Braids & Twists", name: "Boho Knotless Braids", description: "Knotless braids with curly pieces left loose for that dreamy, boho look.", price: "from $150", duration: "5–7 hrs", image: w3.url },
  { category: "Braids & Twists", name: "Extra-Long Boho Twists", description: "Waist-length twists with curly ends — a statement style that turns heads.", price: "from $180", duration: "6–8 hrs", image: w4.url },
  { category: "Wigs", name: "Wig Install", description: "Secure, natural-looking wig installation on your own unit.", price: "from $60", duration: "1–1.5 hrs" },
  { category: "Wigs", name: "Wig Install & Styling", description: "Installation plus curls, waves or a sleek finish styled to suit you.", price: "from $90", duration: "1.5–2 hrs" },
  { category: "Wigs", name: "Wig Styling Only", description: "Refresh a wig you already own with a wash, curl or straight style.", price: "from $40", duration: "1 hr" },
  { category: "Nails", name: "Classic Manicure", description: "Shaping, cuticle care and a polish of your choice.", price: "from $25", duration: "45 min" },
  { category: "Nails", name: "Gel Manicure", description: "Long-lasting, glossy gel colour that stays chip-free for weeks.", price: "from $35", duration: "1 hr" },
];

export const gallery = [
  { src: w1.url, category: "Twists", alt: "Top view of neat parted twists with red and copper colour" },
  { src: w2.url, category: "Twists", alt: "Side view of kinky twists with red and copper tones" },
  { src: w3.url, category: "Braids", alt: "Back view of long black boho knotless braids with curly ends" },
  { src: w4.url, category: "Twists", alt: "Back view of extra-long honey-blonde boho twists outdoors" },
];

// Only real reviews go here.
export const reviews: { name: string; text: string; rating: number; date?: string }[] = [];

export function whatsappLink(text: string) {
  if (!contact.whatsapp) return null;
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const faqs = [
  { q: "Where are you located?", a: "The exact address is shared with you once your appointment request is accepted." },
  { q: "How do I book an appointment?", a: "Use the Book Appointment form. Whitney will get back to you to confirm the date and time." },
  { q: "Are the prices final?", a: "Prices shown are starting prices. The final price depends on length, size and whether hair is included — Whitney confirms it before your appointment." },
  { q: "Do I need to book in advance?", a: "Yes, booking ahead is recommended so Whitney can save enough time for your style." },
  { q: "Do you require deposits or have a cancellation policy?", a: "Booking policies will be shared here soon. Ask Whitney when you book." },
  { q: "What should I bring?", a: "Come with clean, detangled hair. If you're supplying your own braiding hair or wig, bring it along." },
];
