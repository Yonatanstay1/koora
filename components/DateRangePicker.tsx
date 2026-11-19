"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addDaysISO } from "@/lib/live";
import { nightsBetween, todayISO } from "@/lib/stay";
import Icon from "./Icon";

// Search-bar date picker: check-in + check-out fields that open one calendar.
// Computer: two months side by side under the fields. Phone: full-screen sheet.
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS_AHEAD = 18;

function monthStart(iso: string) {
  return iso.slice(0, 8) + "01";
}
function shiftMonth(first: string, n: number) {
  const d = new Date(first + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}
function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}
const short = (iso: string) => fmt(iso, { weekday: "short", day: "numeric", month: "short" });
const monthLabel = (first: string) => fmt(first, { month: "long", year: "numeric" });

type Field = "arrive" | "depart";

export default function DateRangePicker({
  arrive,
  depart,
  onChange,
  bordered = false,
}: {
  arrive: string;
  depart: string;
  onChange: (arrive: string, depart: string) => void;
  bordered?: boolean;
}) {
  const today = todayISO();
  const [field, setField] = useState<Field | null>(null);
  const [hover, setHover] = useState("");
  const [month, setMonth] = useState(monthStart(arrive || today));
  const [desk, setDesk] = useState(true);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const open = field !== null;
  const minMonth = monthStart(today);
  const maxMonth = shiftMonth(minMonth, MONTHS_AHEAD - 1);
  const nights = nightsBetween(arrive, depart);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setDesk(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const place = useCallback(() => {
    const el = fieldsRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(760, window.innerWidth - 32);
    const left = Math.max(16, Math.min(r.left, window.innerWidth - width - 16));
    setPos({ top: r.bottom + window.scrollY + 10, left: left + window.scrollX, width });
  }, []);

  useLayoutEffect(() => {
    if (!open || !desk) return;
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, desk, place]);

  // Computer: bring the whole calendar into view. Phone: lock the page behind the sheet.
  useEffect(() => {
    if (!open) return;
    if (desk) {
      const t = setTimeout(() => {
        const b = popRef.current?.getBoundingClientRect();
        if (b && b.bottom > window.innerHeight - 16) window.scrollBy({ top: b.bottom - window.innerHeight + 24, behavior: "smooth" });
      }, 30);
      return () => clearTimeout(t);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      document.getElementById("drp-" + monthStart(arrive || today))?.scrollIntoView({ block: "start" });
    }, 30);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, desk]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setField(null);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!desk || popRef.current?.contains(t) || fieldsRef.current?.contains(t)) return;
      setField(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, desk]);

  function openAt(f: Field) {
    setMonth(monthStart(arrive || today));
    setField(f === "depart" && !arrive ? "arrive" : f);
  }

  function pick(d: string) {
    if (field === "depart" && arrive && d > arrive) {
      onChange(arrive, d);
      return;
    }
    // Choosing check-in (or a day before the current check-in): start again from here.
    onChange(d, depart && d < depart && field === "arrive" ? depart : "");
    setField("depart");
  }

  // Preview the stay while the pointer moves over check-out days.
  const end = depart || (field === "depart" && arrive && hover > arrive ? hover : "");

  function renderMonth(first: string) {
    const lead = (new Date(first + "T00:00:00Z").getUTCDay() + 6) % 7;
    const cells: (string | null)[] = Array(lead).fill(null);
    for (let d = first; d.slice(0, 7) === first.slice(0, 7); d = addDaysISO(d, 1)) cells.push(d);
    return (
      <div key={first} id={"drp-" + first}>
        <p className={`text-center text-sm font-medium ${desk ? "" : "px-1 text-left text-base"}`}>{monthLabel(first)}</p>
        {desk && (
          <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        )}
        <div className="mt-2 grid grid-cols-7">
          {cells.map((d, i) => {
            if (!d) return <span key={"x" + i} />;
            const past = d < today;
            const isStart = d === arrive;
            const isEnd = d === end;
            const between = !!arrive && !!end && d > arrive && d < end;
            const band = between ? "bg-wash" : isStart && end ? "bg-[linear-gradient(90deg,transparent_50%,#F3F3F0_50%)]" : isEnd && arrive ? "bg-[linear-gradient(90deg,#F3F3F0_50%,transparent_50%)]" : "";
            const label = fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            return (
              <div key={d} className={`flex h-12 items-center justify-center ${band}`}>
                <button
                  type="button"
                  disabled={past}
                  onClick={() => pick(d)}
                  onMouseEnter={() => setHover(d)}
                  aria-label={label + (isStart ? ", check-in" : isEnd && depart ? ", check-out" : "")}
                  aria-pressed={isStart || (isEnd && !!depart)}
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-full text-sm transition-colors",
                    isStart || (isEnd && depart) ? "bg-ink font-medium text-white" : "",
                    isEnd && !depart ? "border border-ink" : "",
                    past ? "cursor-default text-[#C4C4BE] line-through decoration-[#C4C4BE]/60" : "",
                    !past && !isStart && !isEnd ? "hover:border hover:border-ink" : "",
                    d === today && !isStart ? "font-semibold" : "",
                  ].join(" ")}
                >
                  {Number(d.slice(8))}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const prompt = !arrive ? "Choose your check-in date" : !depart ? "Now choose your check-out date" : `${nights} ${nights === 1 ? "night" : "nights"}`;
  const summary = arrive && depart ? `${short(arrive)} – ${short(depart)}` : arrive ? `Check-in ${short(arrive)}` : "Minimum stay depends on the home";

  const footer = (
    <div className="flex items-center justify-between gap-4">
      <button type="button" onClick={() => { onChange("", ""); setField("arrive"); }} className="min-h-11 text-sm font-medium underline underline-offset-4 disabled:opacity-30" disabled={!arrive}>
        Clear dates
      </button>
      <button type="button" onClick={() => setField(null)} className="btn-primary !min-h-11 !rounded-lg !px-6">
        {arrive && !depart ? "Close" : "Done"}
      </button>
    </div>
  );

  const fieldBtn = (f: Field, title: string, value: string) => {
    const active = field === f;
    return (
      <button
        type="button"
        onClick={() => (active ? setField(null) : openAt(f))}
        aria-haspopup="dialog"
        aria-expanded={active}
        className={`block w-full rounded-lg px-3 py-2.5 text-left transition-colors ${bordered ? "min-h-[3.25rem] border border-line " : ""}${active ? "bg-white ring-2 ring-ink" : "bg-paper hover:bg-wash"}`}
      >
        <span className="block text-xs text-muted">{title}</span>
        <span className={`mt-0.5 block truncate text-base ${value ? "text-ink" : "text-muted"}`}>{value ? short(value) : "Add date"}</span>
      </button>
    );
  };

  return (
    <>
      <div ref={fieldsRef} className="col-span-2 grid grid-cols-2 gap-4">
        {fieldBtn("arrive", "Check-in", arrive)}
        {fieldBtn("depart", "Check-out", depart)}
      </div>
      {mounted && open && desk &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Choose your dates"
            style={{ position: "absolute", top: pos.top, left: pos.left, width: pos.width }}
            className="z-[60] rounded-2xl border border-line bg-white p-6 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
            onMouseLeave={() => setHover("")}
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-display text-2xl leading-tight">{prompt}</p>
                <p className="mt-1 text-sm text-muted">{summary}</p>
              </div>
            </div>
            <div className="relative mt-6 grid grid-cols-2 gap-10">
              <button type="button" aria-label="Previous month" disabled={month <= minMonth} onClick={() => setMonth(shiftMonth(month, -1))} className="absolute -top-2 left-0 flex h-9 w-9 items-center justify-center rounded-full hover:bg-wash disabled:opacity-25">
                <Icon name="arrow" className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" aria-label="Next month" disabled={shiftMonth(month, 1) >= maxMonth} onClick={() => setMonth(shiftMonth(month, 1))} className="absolute -top-2 right-0 flex h-9 w-9 items-center justify-center rounded-full hover:bg-wash disabled:opacity-25">
                <Icon name="arrow" className="h-4 w-4" />
              </button>
              {renderMonth(month)}
              {renderMonth(shiftMonth(month, 1))}
            </div>
            <div className="mt-6 border-t border-line pt-4">{footer}</div>
          </div>,
          document.body,
        )}
      {mounted && open && !desk &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label="Choose your dates" className="fixed inset-0 z-[70] flex flex-col bg-white text-ink">
            <div className="flex items-center justify-between px-4 pb-3 pt-4">
              <button type="button" onClick={() => setField(null)} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-line">
                <Icon name="close" className="h-4 w-4" />
              </button>
              <div className="flex rounded-full bg-paper p-1 text-sm">
                {(["arrive", "depart"] as Field[]).map((f) => (
                  <button key={f} type="button" onClick={() => openAt(f)} className={`min-h-9 rounded-full px-4 ${field === f ? "bg-white font-medium shadow-sm" : "text-muted"}`}>
                    {f === "arrive" ? (arrive ? short(arrive) : "Check-in") : depart ? short(depart) : "Check-out"}
                  </button>
                ))}
              </div>
              <span className="w-11" />
            </div>
            <div className="px-5">
              <p className="font-display text-2xl leading-tight">{prompt}</p>
              <p className="mt-1 text-sm text-muted">{summary}</p>
            </div>
            <div className="mt-4 grid grid-cols-7 border-b border-line px-3 pb-2 text-center text-[11px] font-medium text-muted">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-3 py-5">
              {Array.from({ length: MONTHS_AHEAD }, (_, i) => renderMonth(shiftMonth(minMonth, i)))}
            </div>
            <div className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>
          </div>,
          document.body,
        )}
    </>
  );
}
