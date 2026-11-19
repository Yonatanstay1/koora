"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { NAV } from "@/data/site";
const LINKS = NAV.map(([href, label]) => ({ href, label }));
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector("a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (e.key === "Tab") {
        const els = [
          menuButton.current,
          ...Array.from(menu.current?.querySelectorAll("a") || []),
        ].filter(Boolean) as HTMLElement[];
        const i = els.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i === 0) {
          e.preventDefault();
          els.at(-1)?.focus();
        } else if (!e.shiftKey && i === els.length - 1) {
          e.preventDefault();
          els[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const solid = pathname !== "/" || scrolled || open;
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${solid ? "border-white/10 bg-black/85 text-white backdrop-blur-xl" : "border-transparent text-white"}`}
      >
        <div className="container-koora flex h-20 items-center justify-between lg:h-24">
          <Link
            href="/"
            aria-label="Koora home"
            className="flex items-center gap-2.5"
          >
            <span className="text-[32px] font-medium leading-none tracking-[-0.07em]">
              KOORA
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-5 xl:flex"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className="text-[10px] uppercase tracking-[0.06em] transition-opacity hover:opacity-65"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 text-[11px]">
              <Link
                href="/"
                aria-current={pathname === "/es" ? undefined : "true"}
              >
                EN
              </Link>
              <span aria-hidden="true">|</span>
              <Link
                href="/es"
                hrefLang="es"
                aria-current={pathname === "/es" ? "true" : undefined}
                aria-label="Información en español"
              >
                ES
              </Link>
            </div>
            <button
              ref={menuButton}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(!open)}
              className="flex h-12 w-12 items-center justify-center xl:hidden"
            >
              {open ? (
                <Icon name="close" />
              ) : (
                <span className="flex w-6 flex-col gap-[6px]">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-full bg-current" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div
          ref={menu}
          id="mobile-menu"
          className="fixed inset-0 top-20 lg:top-24 z-40 overflow-auto bg-black text-white px-6 py-8 xl:hidden"
        >
          <p className="eyebrow">Homes · Hospitality · Life here</p>
          <nav aria-label="Mobile navigation" className="mt-6 flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-5 font-display text-4xl"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/faq"
              onClick={() => setOpen(false)}
              className="py-5 text-sm"
            >
              Questions about your stay
            </Link>
            <Link
              href="/villas"
              onClick={() => setOpen(false)}
              className="btn-primary mt-5"
            >
              Explore the collection <Icon name="arrow" />
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
