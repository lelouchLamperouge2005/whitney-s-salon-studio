import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { images } from "@/lib/site";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Our Work" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={images.logo} alt="Styled By Whitney logo" className="h-11 w-11 rounded-full object-cover" />
          <span className="font-display text-xl font-semibold tracking-wide">Styled By Whitney</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
          <Link to="/book" className="btn-primary">Book Appointment</Link>
        </nav>
        <button className="lg:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 pb-6 pt-3 lg:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="py-3 font-display text-2xl">
              {l.label}
            </Link>
          ))}
          <Link to="/book" onClick={() => setOpen(false)} className="btn-primary mt-3 text-center">Book Appointment</Link>
        </nav>
      )}
    </header>
  );
}
