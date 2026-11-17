"use client";
import { usePathname } from "next/navigation";
import { CONTACT } from "@/data/villas";
import Icon from "./Icon";
export default function WhatsAppButton() {
  const pathname = usePathname();

  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hi Koora, I would like to speak with your local team.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Koora on WhatsApp"
      className={`fixed right-4 z-30 flex h-12 items-center gap-2 rounded-full border border-white/30 bg-black px-4 text-xs text-white shadow-lg ${pathname.startsWith("/villas/") ? "bottom-28 lg:bottom-6" : "bottom-6"}`}
    >
      <Icon name="chat" className="h-4 w-4" />
      WhatsApp
    </a>
  );
}
