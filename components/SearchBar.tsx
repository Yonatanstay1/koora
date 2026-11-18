"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { stayError } from "@/lib/stay";
import DateRangePicker from "./DateRangePicker";
import Icon from "./Icon";
export default function SearchBar({
  className = "",
}: {
  variant?: "hero" | "plain";
  className?: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [arrive, setArrive] = useState(params.get("arrive") || "");
  const [depart, setDepart] = useState(params.get("depart") || "");
  const [guests, setGuests] = useState(params.get("guests") || "");
  const [error, setError] = useState("");
  return (
    <form
      className={`rounded-2xl border border-line bg-white p-4 lg:p-5 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const err = stayError(arrive, depart);
        setError(err);
        if (err) return;
        const p = new URLSearchParams(params.toString());
        for (const [k, v] of Object.entries({ arrive, depart, guests })) {
          if (v) p.set(k, v);
          else p.delete(k);
        }
        router.push("/villas?" + p.toString(), { scroll: false });
      }}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <DateRangePicker
          arrive={arrive}
          depart={depart}
          onChange={(a, d) => {
            setArrive(a);
            setDepart(d);
            setError("");
          }}
        />
        <label className="relative block rounded-lg bg-paper px-3 py-2.5 transition-colors hover:bg-wash">
          <span className="block text-xs text-muted">Guests</span>
          <select
            aria-label="Guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="mt-0.5 block w-full cursor-pointer appearance-none bg-transparent pr-6 text-base text-ink outline-none"
          >
            <option value="">Any size</option>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
          <Icon name="arrow" className="pointer-events-none absolute bottom-4 right-3 h-3.5 w-3.5 rotate-90 text-muted" />
        </label>
        <button className="btn-primary !min-h-[3.75rem] self-stretch !rounded-lg">
          <Icon name="search" className="h-4 w-4" />
          Find stays
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <p className="mt-4 text-xs leading-5 text-muted">
        Choose your dates to see which homes are free. Sending a booking
        request is free; our team confirms with you.
      </p>
    </form>
  );
}
