"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Villa } from "@/data/villas";
import { nightsBetween, stayError, todayISO } from "@/lib/stay";
import {
  addDaysISO,
  fetchFreeNights,
  fetchQuote,
  money,
  rangeIsFree,
  type Quote,
} from "@/lib/live";
import AvailabilityCalendar from "./AvailabilityCalendar";
import RequestForm from "./RequestForm";
import Icon from "./Icon";
export default function BookingPanel({ villa }: { villa: Villa }) {
  const [arrive, setArrive] = useState("");
  const [depart, setDepart] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"dates" | "details">("dates");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setArrive(p.get("arrive") || "");
    setDepart(p.get("depart") || "");
    const n = Number(p.get("guests"));
    if (Number.isInteger(n) && n > 0) setGuests(String(n));
  }, []);
  // Live Beds24 availability. null = not connected -> inquiry flow as before.
  const lastDay = addDaysISO(todayISO(), 365);
  const [free, setFree] = useState<Set<string> | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  useEffect(() => {
    let alive = true;
    fetchFreeNights(villa.slug, todayISO(), lastDay).then((f) => {
      if (alive) setFree(f);
    });
    return () => {
      alive = false;
    };
  }, [villa.slug, lastDay]);
  const live = free !== null;
  const datesOk = !!arrive && !!depart && !stayError(arrive, depart);
  const datesFree = live && datesOk && rangeIsFree(free, arrive, depart);
  useEffect(() => {
    setQuote(null);
    if (!datesFree || Number(guests) > villa.sleeps) return;
    let alive = true;
    setQuoting(true);
    fetchQuote(villa.slug, arrive, depart, guests).then((q) => {
      if (!alive) return;
      setQuote(q);
      setQuoting(false);
    });
    return () => {
      alive = false;
    };
  }, [datesFree, arrive, depart, guests, villa.slug, villa.sleeps]);
  const nights = nightsBetween(arrive, depart);
  const overCapacity = Number(guests) > villa.sleeps;
  const minStay = live && quote && quote.reason === "minstay" ? quote.minNights || 2 : 0;
  const blocked = live && datesOk && (!datesFree || quote?.reason === "booked" || minStay > 0);
  const canRequest = datesOk && !overCapacity && !blocked && !quoting;
  const estimate = quote?.bookable && quote.total ? money(quote.total, quote.currency) : "";
  const freeElsewhere = "/villas?" + new URLSearchParams({ arrive, depart, guests }).toString();
  const query = new URLSearchParams({
    villa: villa.slug,
    arrive,
    depart,
    guests,
  }).toString();
  return (
    <>
      <aside id="inquire" className="scroll-mt-28">
        <div className="rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-28 lg:p-8">
          <p className="eyebrow">Make yourself at home</p>
          <p className="mt-3 font-display text-4xl">
            ${villa.pricePerNight.toLocaleString()}{" "}
            <span className="font-sans text-xs text-muted">
              USD / night, listed rate
            </span>
          </p>
          <p className="mt-3 text-xs leading-6 text-muted">
            Rates vary by season. We’ll confirm availability, fees and the full
            price before you book.
          </p>
          <p className="mt-3 text-xs font-medium text-ink">
            Book direct with Koora: no booking-platform fees.
          </p>
          {step === "details" ? (
            <RequestForm
              villa={villa}
              arrive={arrive}
              depart={depart}
              nights={nights}
              guests={guests}
              estimate={estimate}
              live={live}
              onBack={() => setStep("dates")}
            />
          ) : (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              const err =
                stayError(arrive, depart, true) ||
                (overCapacity
                  ? `This home accommodates up to ${villa.sleeps} guests.`
                  : "");
              setError(err);
              if (err || !canRequest) return;
              setStep("details");
              document.getElementById("inquire")?.scrollIntoView({ block: "start" });
            }}
          >
            <input type="hidden" name="villa" value={villa.slug} />
            {live && (
              <AvailabilityCalendar
                free={free}
                arrive={arrive}
                depart={depart}
                lastDay={lastDay}
                onChange={(a, d) => {
                  setError("");
                  setArrive(a);
                  setDepart(d);
                }}
              />
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs">
                Arrival
                <input
                  name="arrive"
                  type="date"
                  min={todayISO()}
                  required
                  value={arrive}
                  onChange={(e) => setArrive(e.target.value)}
                  className="field"
                />
              </label>
              <label className="text-xs">
                Departure
                <input
                  name="depart"
                  type="date"
                  min={arrive || todayISO()}
                  required
                  value={depart}
                  onChange={(e) => setDepart(e.target.value)}
                  className="field"
                />
              </label>
            </div>
            <label className="mt-4 block text-xs">
              Guests
              <select
                name="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="field"
              >
                {overCapacity && (
                  <option value={guests}>
                    {guests} guests — exceeds capacity
                  </option>
                )}
                {Array.from({ length: villa.sleeps }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ),
                )}
              </select>
            </label>
            {live && datesOk && !datesFree && (
              <p role="alert" className="mt-4 text-sm text-red-800">
                Some of these nights are already booked. Pick other dates in the
                calendar, or{" "}
                <Link href={freeElsewhere} className="underline underline-offset-2">
                  see the homes free on these dates
                </Link>
                .
              </p>
            )}
            {minStay > 0 && (
              <p role="alert" className="mt-4 text-sm text-red-800">
                From this arrival date the home needs a stay of at least {minStay} nights. Add nights or
                choose another arrival date.
              </p>
            )}
            {nights > 0 && !stayError(arrive, depart) && (!live || datesFree) && (
              <div className="mt-5 border-t border-line pt-4" aria-live="polite">
                {live && quoting && (
                  <p className="text-sm text-muted">Checking the price…</p>
                )}
                {live && !quoting && quote?.bookable && quote.total ? (
                  <p className="flex items-baseline justify-between text-sm">
                    <span>
                      {nights} {nights === 1 ? "night" : "nights"} · {guests}{" "}
                      {guests === "1" ? "guest" : "guests"}
                    </span>
                    <span className="font-display text-2xl">
                      {money(quote.total, quote.currency)}
                    </span>
                  </p>
                ) : null}
                {live && !quoting && quote?.bookable && quote.total && quote.estimate ? (
                  <p className="mt-1 text-[11px] text-muted">
                    Estimated total. Our team confirms the final price with you.
                  </p>
                ) : null}
                {live && !quoting && quote?.bookable && quote.total ? null : live && !quoting && quote && !quote.bookable ? (
                  quote.reason === "noprice" ? (
                    <p className="text-sm text-muted">
                      {nights} {nights === 1 ? "night" : "nights"} · Our team will send you the price
                    </p>
                  ) : null
                ) : (
                  !live || (!quoting && !quote) ? (
                    <p className="text-sm text-muted">
                      {nights} {nights === 1 ? "night" : "nights"} · Final quote
                      provided by our team
                    </p>
                  ) : null
                )}
              </div>
            )}
            {(error || overCapacity) && (
              <p role="alert" className="mt-4 text-sm text-red-800">
                {error ||
                  `This home accommodates up to ${villa.sleeps} guests. Please choose a smaller group or another home.`}
              </p>
            )}
            {live && quote?.bookable && quote.bookUrl && !overCapacity ? (
              <>
                <a href={quote.bookUrl} className="btn-primary mt-6 w-full">
                  Book now <Icon name="arrow" className="h-4 w-4" />
                </a>
                <p className="mt-3 text-center text-[11px] leading-5 text-muted">
                  Secure payment on our booking page. You can review everything
                  before you pay.
                </p>
              </>
            ) : (
              <>
                <button
                  disabled={datesOk && !canRequest}
                  className="btn-primary mt-6 w-full disabled:opacity-50"
                >
                  {quoting ? "Checking…" : "Request to book"}{" "}
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-[11px] leading-5 text-muted">
                  {datesOk
                    ? "No payment now. Next: your name and contact details."
                    : "Choose your dates in the calendar to start."}
                </p>
              </>
            )}
          </form>
          )}
          <div className="mt-6 border-t border-line pt-5">
            <Link
              href={"/contact?" + query}
              className="text-xs underline underline-offset-4"
            >
              Dates undecided? Talk to us
            </Link>
          </div>
        </div>
      </aside>
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-6 pt-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-display text-2xl">
              ${villa.pricePerNight.toLocaleString()}
            </span>
            <span className="ml-1 text-[10px] text-muted">/ night*</span>
            <p className="text-[10px] text-muted">
              *Listed rate · quote on request
            </p>
          </div>
          <a
            href="#inquire"
            className="btn-primary !min-h-11 !px-5 !py-3 text-xs"
          >
            Plan this stay <Icon name="arrow" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  );
}
