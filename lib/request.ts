// Booking requests (no payment). The guest's details go by email to the office,
// which confirms with the owner and replies. Delivery: FormSubmit (free, no server).
// The very first request triggers a one-time "Activate form" email to the inbox.
import { CONTACT } from "@/data/villas";

export const REQUEST_INBOX = process.env.NEXT_PUBLIC_REQUEST_EMAIL || CONTACT.email;

export interface StayRequest {
  reference: string;
  villaName: string;
  villaUrl: string;
  arrive: string;
  depart: string;
  nights: number;
  guests: string;
  estimate: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  honey: string;
}

export function newReference() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `K-${t}${r}`;
}

export function requestText(r: StayRequest) {
  return [
    `Hi Koora, I'd like to book ${r.villaName}.`,
    `Dates: ${r.arrive} to ${r.depart} (${r.nights} ${r.nights === 1 ? "night" : "nights"})`,
    `Guests: ${r.guests}`,
    r.estimate ? `Estimated total: ${r.estimate}` : "",
    `Name: ${r.name}`,
    `Email: ${r.email}`,
    `Phone: ${r.phone}`,
    r.message ? `Note: ${r.message}` : "",
    `Reference: ${r.reference}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function whatsappLink(text: string) {
  return `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

// true = the office inbox received it.
export async function sendRequest(r: StayRequest): Promise<boolean> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${REQUEST_INBOX}`, {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `Booking request ${r.reference}: ${r.villaName}, ${r.arrive} to ${r.depart}, ${r.guests} guests`,
        _template: "table",
        _captcha: "false",
        _replyto: r.email,
        _honey: r.honey,
        "Reference": r.reference,
        "Home": r.villaName,
        "Check-in": r.arrive,
        "Check-out": r.depart,
        "Nights": String(r.nights),
        "Guests": r.guests,
        "Estimated total (website)": r.estimate || "Not shown, team to quote",
        "Guest name": r.name,
        "Guest email": r.email,
        "Guest phone / WhatsApp": r.phone,
        "Guest note": r.message || "-",
        "Home page": r.villaUrl,
        "Next step": "Not confirmed yet. Check the dates with the owner, then reply to the guest.",
      }),
    });
    const body = await res.json().catch(() => null);
    return res.ok && (body?.success === true || body?.success === "true");
  } catch {
    return false;
  }
}
