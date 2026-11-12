import { Link } from "@tanstack/react-router";
import { contact, images } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-royal-gradient">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src={images.logo} alt="Styled By Whitney logo" className="h-20 w-20 rounded-full object-cover" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Braids, twists and wigs — styled with care, creativity and confidence by Whitney.
          </p>
          <Link to="/book" className="btn-primary mt-6 inline-block">Book Appointment</Link>
        </div>
        <div>
          <h4 className="eyebrow mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Whitney</Link></li>
            <li><Link to="/gallery" className="hover:text-primary">Our Work</Link></li>
            <li><Link to="/reviews" className="hover:text-primary">Reviews</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-4">Get in touch</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp: {contact.phone}</a></li>
            <li><a href={contact.phoneHref} className="hover:text-primary">Call: {contact.phone}</a></li>
            {contact.instagram && <li><a href={contact.instagram} target="_blank" rel="noreferrer" className="hover:text-primary">Instagram {contact.instagramHandle}</a></li>}
            {contact.tiktok && <li><a href={contact.tiktok} className="hover:text-primary">TikTok</a></li>}
            <li>Location shared after booking</li>
            <li><Link to="/admin" className="text-xs hover:text-primary">Owner login</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Styled By Whitney. All rights reserved.
      </p>
    </footer>
  );
}
