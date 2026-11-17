// Browser side of the Beds24 connection. Every call fails soft: if the
// connection is off, a villa is not linked, or Beds24 is slow, the page keeps
// the inquiry flow and never shows a wrong availability.
const BASE = process.env.NEXT_PUBLIC_BEDS24_API || "/api/beds24";
// Static mode (GitHub hosting): a scheduled job writes /live/<villa>.json every 15 minutes.
const STATIC = process.env.NEXT_PUBLIC_BEDS24_STATIC === "1";
const SITE_BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface LiveFile {
  updated: string;
  currency: string;
  free: string[];
  price: Record<string, number>;
  minStay?: Record<string, number>;
  book?: { base: string; propertyId: number; roomId: number } | null;
}
const files = new Map<string, Promise<LiveFile | null>>();
function liveFile(villa: string) {
  if (!files.has(villa)) {
    files.set(
      villa,
      (async () => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
          const res = await fetch(`${SITE_BASE}/live/${villa}.json`, { signal: ctrl.signal, cache: "no-cache" });
          if (!res.ok) return null;
          const body = (await res.json()) as LiveFile;
          // Older than 6 hours = the sync stopped. Do not show a stale calendar.
          if (!body.updated || Date.now() - Date.parse(body.updated) > 6 * 3600e3) return null;
          return body;
        } catch {
          return null;
        } finally {
          clearTimeout(timer);
        }
      })(),
    );
  }
  return files.get(villa)!;
}
const TIMEOUT_MS = 8000;

export interface Quote {
  bookable: boolean;
  total?: number;
  nights?: number;
  currency?: string;
  bookUrl?: string | null;
  estimate?: boolean;
}

async function getJson<T>(path: string): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, { signal: ctrl.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchFreeNights(villa: string, from: string, to: string) {
  if (STATIC) {
    const f = await liveFile(villa);
    return f ? new Set(f.free.filter((d) => d >= from && d <= to)) : null;
  }
  const q = new URLSearchParams({ villa, from, to });
  const body = await getJson<{ free: string[] }>("/availability?" + q);
  return body && Array.isArray(body.free) ? new Set(body.free) : null;
}

export async function fetchQuote(villa: string, arrive: string, depart: string, guests: string) {
  if (STATIC) {
    const f = await liveFile(villa);
    if (!f) return null;
    const free = new Set(f.free);
    let total = 0;
    let nights = 0;
    for (let d = arrive; d < depart; d = addDaysISO(d, 1)) {
      if (!free.has(d) || !(f.price[d] > 0)) return { bookable: false } as Quote;
      total += f.price[d];
      nights++;
    }
    const min = f.minStay?.[arrive] || 1;
    if (nights < min) return { bookable: false } as Quote;
    let bookUrl: string | null = null;
    if (f.book) {
      const u = new URL(f.book.base);
      u.searchParams.set("propid", String(f.book.propertyId));
      u.searchParams.set("roomid", String(f.book.roomId));
      u.searchParams.set("checkin", arrive);
      u.searchParams.set("checkout", depart);
      u.searchParams.set("numnight", String(nights));
      u.searchParams.set("numadult", guests);
      bookUrl = u.toString();
    }
    return { bookable: true, total, nights, currency: f.currency, bookUrl, estimate: true } as Quote;
  }
  const q = new URLSearchParams({ villa, arrive, depart, guests });
  return getJson<Quote>("/quote?" + q);
}

export function addDaysISO(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Every night from arrival up to (not including) departure must be free.
export function rangeIsFree(free: Set<string>, arrive: string, depart: string) {
  for (let d = arrive; d < depart; d = addDaysISO(d, 1)) if (!free.has(d)) return false;
  return true;
}

export function money(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return "$" + Math.round(amount).toLocaleString();
  }
}
