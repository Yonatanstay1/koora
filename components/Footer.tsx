import Link from "next/link";
import { CONTACT } from "@/data/villas";
import { NAV, SITE } from "@/data/site";
export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container-koora pb-8 pt-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-5xl tracking-[-0.07em]">
              KOORA
            </Link>
            <p className="mt-6 text-sm leading-7 text-white/65">
              Homes. Hospitality. Life here.
              <br />
              Santa Teresa · Malpaís
              <br />
              Costa Rica
            </p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex flex-col gap-3 text-xs"
          >
            {NAV.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="space-y-4 text-xs">
            <p className="uppercase tracking-widest text-white/60">Contact</p>
            <a className="block" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            <a
              className="block"
              href={`tel:${CONTACT.phone1.replace(/\s/g, "")}`}
            >
              {CONTACT.phone1}
            </a>
            <a
              className="block"
              href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
            >
              WhatsApp ↗
            </a>
            <Link className="block pt-5" href="/payment">
              Make a Payment ↗
            </Link>
          </div>
          <div className="space-y-4 text-xs">
            <p className="uppercase tracking-widest text-white/60">Social</p>
            <a
              className="block"
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer"
            >
              Instagram ↗
            </a>
            {SITE.youtube && (
              <a
                className="block"
                href={SITE.youtube}
                target="_blank"
                rel="noreferrer"
              >
                YouTube ↗
              </a>
            )}
            <a
              className="block"
              href={CONTACT.facebook}
              target="_blank"
              rel="noreferrer"
            >
              Facebook ↗
            </a>
            <div className="flex gap-3 pt-5">
              <Link href="/">EN</Link>
              <span>|</span>
              <Link href="/es" hrefLang="es">
                ES
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap justify-between gap-5 border-t border-white/20 pt-6 text-[11px] text-white/65">
          <p>© {new Date().getFullYear()} Koora</p>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <p>Stays · Estate Management · Development</p>
        </div>
      </div>
    </footer>
  );
}
