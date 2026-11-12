export const images = {
  logo: "/logo.jpeg",
  portrait: "/portrait-black-background.jpg",
  w1: "/braids_1_topdown_blurred.jpg",
  w2: "/braids_2_side_blurred.jpg",
  w3: "/braids_3_store_blurred.jpg",
  w4: "/braids_4_outdoor_blurred.jpg",
  w5: "/work-5.jpg",
  w6: "/work-6.jpg",
  w7: "/work-7.jpg",
  w8: "/work-8.jpg",
};

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
  { category: "Braids & Twists", name: "Colour Twists", description: "Neat parted twists with a pop of colour blended through for a playful, fresh finish.", price: "from $90", duration: "3-4 hrs", image: images.w1 },
  { category: "Braids & Twists", name: "Kinky Twists (Shoulder Length)", description: "Soft, textured twists with fluffy ends — lightweight and full of movement.", price: "from $100", duration: "3–5 hrs", image: images.w2 },
  { category: "Braids & Twists", name: "Boho Knotless Braids", description: "Knotless braids with curly pieces left loose for that dreamy, boho look.", price: "from $150", duration: "5–7 hrs", image: images.w3 },
  { category: "Braids & Twists", name: "Extra-Long Boho Twists", description: "Waist-length twists with curly ends — a statement style that turns heads.", price: "from $180", duration: "6–8 hrs", image: images.w4 },
  { category: "Wigs", name: "Wig Install", description: "Secure, natural-looking wig installation on your own unit.", price: "from $60", duration: "1–1.5 hrs" },
  { category: "Wigs", name: "Wig Install & Styling", description: "Installation plus curls, waves or a sleek finish styled to suit you.", price: "from $90", duration: "1.5–2 hrs" },
  { category: "Wigs", name: "Wig Styling Only", description: "Refresh a wig you already own with a wash, curl or straight style.", price: "from $40", duration: "1 hr" },
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

export const gallery = [
  { src: images.w1, category: "Twists", alt: "Top view of neat parted twists with red and copper colour" },
  { src: images.w2, category: "Twists", alt: "Side view of kinky twists with red and copper tones" },
  { src: images.w3, category: "Braids", alt: "Back view of long black boho knotless braids with curly ends" },
  { src: images.w4, category: "Twists", alt: "Back view of extra-long honey-blonde boho twists outdoors" },
  { src: images.w5, category: "Styles", alt: "Long, straight honey-blonde hair styled with a mint sparkle dress and a bouquet" },
  { src: images.w6, category: "Braids", alt: "Long copper-red curly braids with a cream headband and a plaid shirt" },
  { src: images.w7, category: "Styles", alt: "Honey-blonde hair with a sleek, laid edge finish and a black headband" },
  { src: images.w8, category: "Braids", alt: "Honey-brown curly hair with braided front sections and baby hair" },
];