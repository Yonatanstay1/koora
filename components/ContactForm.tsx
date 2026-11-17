"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONTACT, VILLAS } from "@/data/villas";
import { stayError, todayISO } from "@/lib/stay";
import Icon from "./Icon";
export default function ContactForm() {
  const whatsappOnly = process.env.NEXT_PUBLIC_INQUIRY_MODE === "whatsapp";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    interest: "Booking a Villa",
    email: "",
    arrive: "",
    depart: "",
    guests: "2",
    villa: "",
    message: "",
    website: "",
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const key = useRef("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setForm((f) => ({
      ...f,
      ...Object.fromEntries(
        ["arrive", "depart", "guests", "villa", "interest", "message"].map(
          (k) => [k, p.get(k) || f[k as keyof typeof f]],
        ),
      ),
    }));
  }, []);
  const set =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      key.current = "";
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
  const selected = VILLAS.find((v) => v.slug === form.villa);
  const text = `Hi Koora, I’m interested in ${form.interest}.\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}${form.interest === "Booking a Villa" ? `\nHome: ${selected?.name || "Please recommend a home"}\nDates: ${form.arrive || "Flexible"}${form.depart ? " to " + form.depart : ""}\nGuests: ${form.guests}` : ""}\n${form.message}`;
  const whatsapp = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  if (reference)
    return (
      <div
        role="status"
        className="rounded-2xl border border-line bg-white p-8"
      >
        <Icon name="check" className="h-10 w-10 text-clay" />
        <h2 className="mt-4 font-display text-4xl">Your inquiry is saved.</h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Reference:{" "}
          <span className="break-all font-medium text-ink">{reference}</span>
          <br />
          This is an inquiry, not a confirmed reservation. You can also send
          your details directly to our team on WhatsApp.
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6"
        >
          Continue on WhatsApp <Icon name="arrow" className="h-4 w-4" />
        </a>
        <button
          onClick={() => {
            setReference("");
            key.current = "";
          }}
          className="mt-5 block text-sm underline underline-offset-4"
        >
          Start another inquiry
        </button>
      </div>
    );
  return (
    <form
      className="rounded-2xl border border-line bg-white p-6 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const validation =
          form.interest !== "Booking a Villa"
            ? ""
            : stayError(form.arrive, form.depart) ||
              (selected && Number(form.guests) > selected.sleeps
                ? `This home accommodates up to ${selected.sleeps} guests. Choose another home or “Help me choose”.`
                : "");
        setError(validation);
        if (validation) return;
        if (whatsappOnly) {
          window.location.assign(whatsapp);
          return;
        }
        setBusy(true);
        if (!key.current) key.current = crypto.randomUUID();
        try {
          const response = await fetch("/api/inquiries", {
            method: "POST",
            signal: AbortSignal.timeout(15000),
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": key.current,
            },
            body: JSON.stringify({
              ...form,
              guests:
                form.interest === "Booking a Villa" ? Number(form.guests) : 1,
              ...(form.interest !== "Booking a Villa"
                ? { arrive: "", depart: "", villa: "" }
                : {}),
              consent,
            }),
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result?.id) {
            if (response.status === 409) key.current = "";
            throw new Error(
              result?.error ||
                "Online inquiries are temporarily unavailable. Your details are still here—send them on WhatsApp below.",
            );
          }
          setReference(result.id);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn’t save your inquiry. Please use WhatsApp below.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="eyebrow">A few details to get started</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs">
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={set("name")}
            className="field"
            placeholder="First and last name"
          />
        </label>
        <label className="text-xs">
          Email address
          <input
            name="email"
            autoComplete="email"
            type="email"
            required
            maxLength={254}
            value={form.email}
            onChange={set("email")}
            className="field"
            placeholder="you@example.com"
          />
        </label>
        <label className="text-xs">
          Phone / WhatsApp
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            value={form.phone}
            onChange={set("phone")}
            className="field"
          />
        </label>
        <label className="text-xs">
          I’m interested in
          <select
            name="interest"
            value={form.interest}
            onChange={set("interest")}
            className="field"
          >
            {[
              "Booking a Villa",
              "Estate Management",
              "Development / Construction",
              "Selected Property",
              "Other",
            ].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        {form.interest === "Booking a Villa" && (
          <>
            <label className="text-xs">
              Arrival · optional
              <input
                name="arrive"
                type="date"
                min={todayISO()}
                value={form.arrive}
                onChange={set("arrive")}
                className="field"
              />
            </label>
            <label className="text-xs">
              Departure · optional
              <input
                name="depart"
                type="date"
                min={form.arrive || todayISO()}
                value={form.depart}
                onChange={set("depart")}
                className="field"
              />
            </label>
            <label className="text-xs">
              Number of guests
              <input
                name="guests"
                type="number"
                required
                min={1}
                max={30}
                value={form.guests}
                onChange={set("guests")}
                className="field"
              />
            </label>
            <label className="text-xs">
              Your kind of place
              <select
                name="villa"
                value={form.villa}
                onChange={set("villa")}
                className="field"
              >
                <option value="">Help me choose</option>
                {VILLAS.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <label className="text-xs sm:col-span-2">
          Anything else we should know?
          <textarea
            name="message"
            rows={4}
            maxLength={3000}
            value={form.message}
            onChange={set("message")}
            className="field resize-y"
            placeholder="Tell us about your stay, your property or your project…"
          />
        </label>
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set("website")}
          />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-3 text-xs leading-6 text-muted">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-ink"
        />
        <span>
          Koora may use these details to respond to my inquiry.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy details
          </Link>
          .
        </span>
      </label>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-800"
        >
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="btn-primary mt-6 w-full disabled:opacity-60"
      >
        {busy ? "Saving your inquiry…" : whatsappOnly ? "Continue on WhatsApp" : "Send inquiry"}
        <Icon name="arrow" className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-[11px] text-muted">
        {whatsappOnly ? "Opens a draft in WhatsApp. Review it and tap send to contact Koora." : "No payment required to send an inquiry."}
      </p>
      <div className="mt-6 border-t border-line pt-5 text-center">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4"
        >
          Prefer WhatsApp? Send these details ↗
        </a>
        <p className="mt-2 text-[11px] leading-5 text-muted">
          Opens a draft in WhatsApp. Tap send there to contact Koora.
        </p>
      </div>
    </form>
  );
}
