"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import VillaCard from "@/components/VillaCard";
import { VILLAS } from "@/data/villas";
import { stayQuery } from "@/lib/stay";
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
          {results.length} {results.length === 1 ? "stay" : "stays"}
        </span>
      </div>
      {pets && (
        <p className="mt-5 text-sm text-muted">
          Travelling with a pet? Mention it in your inquiry; our team will
          confirm each home’s policy.
        </p>
      )}
      {results.length ? (
        <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((v) => (
            <VillaCard key={v.slug} villa={v} query={query} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h2 className="font-display text-4xl">Let’s find another fit.</h2>
          <p className="my-4 text-sm text-muted">
            Try a different group size, or ask us to help plan your stay.
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
