"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { stayError, todayISO } from "@/lib/stay";
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
        <label className="text-xs text-muted">
          Check-in
          <input
            aria-label="Arrival"
            type="date"
            min={todayISO()}
            value={arrive}
            onChange={(e) => setArrive(e.target.value)}
            className="field !border-0 !bg-paper"
          />
        </label>
        <label className="text-xs text-muted">
          Check-out
          <input
            aria-label="Departure"
            type="date"
            min={arrive || todayISO()}
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="field !border-0 !bg-paper"
          />
        </label>
        <label className="text-xs text-muted">
          Guests
          <select
            aria-label="Guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="field !border-0 !bg-paper"
          >
            <option value="">Any size</option>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary self-end !rounded-lg">
          <Icon name="search" className="h-4 w-4" />
          Find stays
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <p className="mt-4 text-[11px] leading-5 text-muted">
        Choose your dates to see which homes are free. Sending a booking
        request is free; our team confirms with you.
      </p>
    </form>
  );
}
