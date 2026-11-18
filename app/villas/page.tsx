"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import VillaCard from "@/components/VillaCard";
import { VILLAS } from "@/data/villas";
import { nightsBetween, stayError, stayQuery } from "@/lib/stay";
import { fetchFreeNights, fetchQuote, money, niceDate, rangeIsFree } from "@/lib/live";

type Status = { state: "free" | "booked" | "minstay" | "unknown"; total?: string; minNights?: number };
function Collection() {
  const params = useSearchParams();
  const guests = Number(params.get("guests")) || 0;
  const kind = params.get("kind") || "all";
  const city = params.get("city");
  const pets = params.get("pets") === "1";
  const results = VILLAS.filter(
    (v) =>
      (!guests || v.sleeps >= guests) &&
      (!city || v.city === city) &&
      (kind === "all" ||
        (kind === "couples"
          ? v.sleeps <= 2
          : kind === "groups"
            ? v.sleeps >= 8
            : kind === "pool"
              ? v.amenities.includes("Swimming Pool")
              : true)),
  );
  const query = stayQuery(new URLSearchParams(params.toString()));
  // With dates chosen: check every home against the live Beds24 calendar.
  const arrive = params.get("arrive") || "";
  const depart = params.get("depart") || "";
  const withDates = !!arrive && !!depart && !stayError(arrive, depart);
  const nights = nightsBetween(arrive, depart);
  const [status, setStatus] = useState<Record<string, Status> | null>(null);
  useEffect(() => {
    setStatus(null);
    if (!withDates) return;
    let alive = true;
    Promise.all(
      VILLAS.map(async (v): Promise<[string, Status]> => {
        const free = await fetchFreeNights(v.slug, arrive, depart);
        if (!free) return [v.slug, { state: "unknown" }];
        if (!rangeIsFree(free, arrive, depart)) return [v.slug, { state: "booked" }];
        const q = await fetchQuote(v.slug, arrive, depart, params.get("guests") || "2");
        if (q?.reason === "booked") return [v.slug, { state: "booked" }];
        if (q?.reason === "minstay") return [v.slug, { state: "minstay", minNights: q.minNights }];
        return [v.slug, { state: "free", total: q?.bookable && q.total ? money(q.total, q.currency) : undefined }];
      }),
    ).then((rows) => alive && setStatus(Object.fromEntries(rows)));
    return () => {
      alive = false;
    };
  }, [withDates, arrive, depart, params]);
  const checking = withDates && !status;
  const shown = withDates && status ? results.filter((v) => ["free", "unknown"].includes(status[v.slug]?.state)) : results;
  const booked = withDates && status ? results.filter((v) => status[v.slug]?.state === "booked") : [];
  const longer = withDates && status ? results.filter((v) => status[v.slug]?.state === "minstay") : [];
  return (
    <div className="container-koora pb-20 pt-32 lg:pt-44">
      <div className="max-w-2xl">
        <p className="eyebrow">The Koora collection</p>
        <h1 className="section-title mt-4">
          Your own little
          <br />
          <em>somewhere.</em>
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-7 text-muted">
          From jungle studios to villas made for gathering. Find the home that
          fits the way you want to stay.
        </p>
      </div>
      <SearchBar key={params.toString()} className="mt-10" />
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {[
          ["all", "All stays"],
          ["couples", "Just the two of you"],
          ["pool", "Pool days"],
          ["groups", "Together, somewhere"],
        ].map(([value, label]) => {
          const p = new URLSearchParams(params.toString());
          p.set("kind", value);
          return (
            <Link
              key={value}
              href={"/villas?" + p.toString()}
              scroll={false}
              aria-current={kind === value ? "true" : undefined}
              className={`rounded-full border px-5 py-3 text-xs ${kind === value ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
            >
              {label}
            </Link>
          );
        })}
        <span className="ml-auto text-xs text-muted">
          {checking
            ? "Checking availability…"
            : `${shown.length} ${shown.length === 1 ? "stay" : "stays"}${withDates ? " free" : ""}`}
        </span>
      </div>
      {pets && (
        <p className="mt-5 text-sm text-muted">
          Travelling with a pet? Mention it in your inquiry; our team will
          confirm each home’s policy.
        </p>
      )}
      {withDates && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {checking
            ? "Checking which homes are free…"
            : `Free from ${niceDate(arrive)} to ${niceDate(depart)}, ${nights} ${nights === 1 ? "night" : "nights"}. Pick a home to send a booking request.`}
        </p>
      )}
      {checking ? (
        <div className="py-20 text-center text-sm text-muted">Checking availability…</div>
      ) : shown.length ? (
        <>
          <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((v) => (
              <VillaCard
                key={v.slug}
                villa={v}
                query={query}
                stay={withDates && status?.[v.slug]?.state === "free" ? { total: status[v.slug].total, nights } : undefined}
              />
            ))}
          </div>
          {(booked.length > 0 || longer.length > 0) && (
            <div className="mt-14 border-t border-line pt-6 text-sm leading-7 text-muted">
              {booked.length > 0 && (
                <p>
                  Booked on these dates: {booked.map((v) => v.name).join(", ")}.
                </p>
              )}
              {longer.map((v) => (
                <p key={v.slug}>
                  <Link href={`/villas/${v.slug}?${query}`} className="underline underline-offset-2">
                    {v.name}
                  </Link>{" "}
                  is free but needs at least {status?.[v.slug]?.minNights} nights from this date.
                </p>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <h2 className="font-display text-4xl">
            {withDates ? "Nothing free on those dates." : "Let’s find another fit."}
          </h2>
          <p className="my-4 text-sm text-muted">
            {withDates
              ? "Try moving your dates a little, or ask us and we’ll help you find a stay."
              : "Try a different group size, or ask us to help plan your stay."}
          </p>
          <Link href="/villas" className="btn-ghost">
            Clear filters
          </Link>
          <Link href="/contact" className="btn-primary ml-3">
            Talk to Koora
          </Link>
        </div>
      )}
    </div>
  );
}
export default function VillasPage() {
  return (
    <Suspense
      fallback={
        <div className="container-koora py-40">Loading the collection…</div>
      }
    >
      <Collection />
    </Suspense>
  );
}
