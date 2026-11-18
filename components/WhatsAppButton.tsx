"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONTACT } from "@/data/villas";
import Icon from "./Icon";
// Floating WhatsApp button. On phones it steps aside while the guest is typing
// or looking at the booking box, so it never covers a field or a button.
export default function WhatsAppButton() {
  const pathname = usePathname();
  const [typing, setTyping] = useState(false);
  const [panelInView, setPanelInView] = useState(false);
  useEffect(() => {
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    const on = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const off = (e: FocusEvent) => isField(e.target) && setTyping(false);
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", off);
    return () => {
      document.removeEventListener("focusin", on);
      document.removeEventListener("focusout", off);
    };
  }, []);
  useEffect(() => {
    setPanelInView(false);
    const el = document.getElementById("inquire");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPanelInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  const hidePhone = typing || panelInView;
  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hi Koora, I would like to speak with your local team.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Koora on WhatsApp"
      className={`fixed right-4 z-30 flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-black text-xs lg:w-auto lg:px-4 text-white shadow-lg transition-opacity duration-200 ${pathname.startsWith("/villas/") ? "bottom-28 lg:bottom-6" : "bottom-6"} ${hidePhone ? "pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100" : ""}`}
    >
      <Icon name="chat" className="h-5 w-5 lg:h-4 lg:w-4" />
      <span className="hidden lg:inline">WhatsApp</span>
    </a>
  );
}
