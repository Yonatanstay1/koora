"use client";
import Link from "next/link";
import { useState } from "react";
import type { Villa } from "@/data/villas";
import { fetchFreeNights, niceDate, rangeIsFree, refreshLive } from "@/lib/live";
import { newReference, requestText, sendRequest, whatsappLink, type StayRequest } from "@/lib/request";
import Icon from "./Icon";

// Step 2 of "Request to book": the guest's details. No card, no payment.
export default function RequestForm({
  villa,
  arrive,
  depart,
  nights,
  guests,
  estimate,
  live,
  onBack,
}: {
  villa: Villa;
  arrive: string;
  depart: string;
  nights: number;
  guests: string;
  estimate: string;
  live: boolean;
  onBack: () => void;
}) {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "", honey: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<StayRequest | null>(null);
  const [failed, setFailed] = useState<StayRequest | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value }));

  const summary = (
    <div className="rounded-xl bg-paper p-4 text-sm leading-6">
      <p className="font-medium">{villa.name}</p>
      <p className="text-muted">
        {niceDate(arrive)} to {niceDate(depart)}
        <br />
        {nights} {nights === 1 ? "night" : "nights"} · {guests} {guests === "1" ? "guest" : "guests"}
        {estimate && (
          <>
            <br />
            Estimated total <span className="text-ink">{estimate}</span>
          </>
        )}
      </p>
    </div>
  );

  if (sent)
    return (
      <div role="status" className="mt-6">
        <Icon name="check" className="h-9 w-9 text-clay" />
        <h3 className="mt-3 font-display text-3xl leading-tight">Request sent.</h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          Thank you, {sent.name.split(" ")[0]}. Our team is checking these dates with the home now and will
          contact you by email or WhatsApp, usually within a few hours.
        </p>
        <div className="mt-5">{summary}</div>
        <p className="mt-4 text-sm leading-6">
          Your reference: <span className="font-medium">{sent.reference}</span>
        </p>
        <p className="mt-2 text-xs leading-5 text-muted">
          This is a request, not a confirmed booking yet. Nothing has been charged.
        </p>
        <a href={whatsappLink(requestText(sent))} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-5 w-full">
          Message us on WhatsApp
        </a>
      </div>
    );

  return (
    <form
      className="mt-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setError("");
        setFailed(null);
        setBusy(true);
        // Dates may have been taken since the page opened: read the latest calendar first.
        if (live) {
          refreshLive(villa.slug);
          const fresh = await fetchFreeNights(villa.slug, arrive, depart);
          if (fresh && !rangeIsFree(fresh, arrive, depart)) {
            setBusy(false);
            setError("Sorry, some of these nights were just booked. Go back and choose other dates.");
            return;
          }
        }
        const r: StayRequest = {
          reference: newReference(),
          villaName: villa.name,
          villaUrl: window.location.origin + window.location.pathname,
          arrive,
          depart,
          nights,
          guests,
          estimate,
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          message: f.message.trim(),
          honey: f.honey,
        };
        const ok = await sendRequest(r);
        setBusy(false);
        if (ok) setSent(r);
        else setFailed(r);
      }}
    >
      <button type="button" onClick={onBack} className="text-xs underline underline-offset-4">
        ← Change dates
      </button>
      <div className="mt-4">{summary}</div>
      <label className="mt-5 block text-xs">
        Your name
        <input required minLength={2} maxLength={100} autoComplete="name" value={f.name} onChange={set("name")} className="field" placeholder="First and last name" />
      </label>
      <label className="mt-4 block text-xs">
        Email
        <input required type="email" maxLength={254} autoComplete="email" value={f.email} onChange={set("email")} className="field" placeholder="you@example.com" />
      </label>
      <label className="mt-4 block text-xs">
        Phone / WhatsApp
        <input required type="tel" minLength={6} maxLength={40} autoComplete="tel" value={f.phone} onChange={set("phone")} className="field" placeholder="+1 555 123 4567" />
      </label>
      <label className="mt-4 block text-xs">
        Anything we should know? · optional
        <textarea rows={3} maxLength={2000} value={f.message} onChange={set("message")} className="field resize-y" placeholder="Arrival time, children, pets, special occasion…" />
      </label>
      <div className="hidden" aria-hidden="true">
        <input name="_honey" tabIndex={-1} autoComplete="off" value={f.honey} onChange={set("honey")} />
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {error}
        </p>
      )}
      {failed && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-800">
          We couldn’t send your request just now. Your details are ready: tap below to send them on WhatsApp instead.
          <a href={whatsappLink(requestText(failed))} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 w-full">
            Send on WhatsApp
          </a>
        </div>
      )}
      <button disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
        {busy ? "Sending your request…" : "Send booking request"} <Icon name="arrow" className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-muted">
        No payment now. Our team confirms with you before anything is booked.{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy
        </Link>
      </p>
    </form>
  );
}
