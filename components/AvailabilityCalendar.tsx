"use client";
import { useMemo, useState } from "react";
import { addDaysISO, rangeIsFree } from "@/lib/live";
import { todayISO } from "@/lib/stay";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthStart(iso: string) {
  return iso.slice(0, 8) + "01";
}
function shiftMonth(first: string, n: number) {
  const d = new Date(first + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}

// One month at a time with large tap targets. Tap arrival, then departure.
// A booked night can still be a departure day (guests leave that morning).
export default function AvailabilityCalendar({
  free,
  arrive,
  depart,
  lastDay,
  onChange,
}: {
  free: Set<string>;
  arrive: string;
  depart: string;
  lastDay: string;
  onChange: (arrive: string, depart: string) => void;
}) {
  const today = todayISO();
  const [month, setMonth] = useState(monthStart(arrive || today));
  const [hint, setHint] = useState("");
  const minMonth = monthStart(today);
  const maxMonth = monthStart(lastDay);

  const cells = useMemo(() => {
    const first = new Date(month + "T00:00:00Z");
    const lead = (first.getUTCDay() + 6) % 7;
    const days: (string | null)[] = Array(lead).fill(null);
    for (let d = month; d.slice(0, 7) === month.slice(0, 7); d = addDaysISO(d, 1)) days.push(d);
    return days;
  }, [month]);

  const label = new Date(month + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function pick(d: string) {
    setHint("");
    const choosingDeparture = arrive && !depart && d > arrive;
    if (choosingDeparture) {
      if (rangeIsFree(free, arrive, d)) return onChange(arrive, d);
      setHint("Some nights in between are booked. Choose an earlier departure.");
      return;
    }
    if (!free.has(d)) {
      setHint("That night is booked. Choose another arrival day.");
      return;
    }
    onChange(d, "");
  }

  return (
    <div className="mt-6" aria-label="Availability calendar">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          disabled={month <= minMonth}
          className="h-11 w-11 text-lg disabled:opacity-25"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-sm font-medium" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={month >= maxMonth}
          className="h-11 w-11 text-lg disabled:opacity-25"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-muted">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((d, i) => {
          if (!d) return <span key={"x" + i} />;
          const past = d < today || d > lastDay;
          const isFree = free.has(d);
          const isEnd = d === arrive || d === depart;
          const inRange = arrive && depart && d > arrive && d < depart;
          const canDepart = !!arrive && !depart && d > arrive;
          const disabled = past || (!isFree && !canDepart);
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => pick(d)}
              aria-pressed={isEnd}
              aria-label={`${d}${isFree ? ", available" : ", booked"}`}
              className={[
                "mx-auto flex h-11 w-full items-center justify-center",
                isEnd ? "bg-ink text-white" : inRange ? "bg-wash" : "",
                !isEnd && (past || !isFree) ? "text-[#B5B5B0]" : "",
                !isEnd && !past && !isFree ? "line-through" : "",
                !disabled && !isEnd ? "hover:bg-wash" : "",
              ].join(" ")}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-5 text-[11px] text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border border-ink" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[#B5B5B0] line-through">12</span> Booked
        </span>
      </div>
      {hint && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {hint}
        </p>
      )}
    </div>
  );
}
