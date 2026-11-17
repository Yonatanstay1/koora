// Scheduled on GitHub (every 15 min): read Beds24 and write public/live/<villa>.json
// with free nights, nightly prices and minimum stay for the next 365 days.
// Fail-soft: no key, unmapped villa or a Beds24 error = no file = the page keeps
// the inquiry flow. The key comes from the BEDS24_REFRESH_TOKEN secret and is never written.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const API = "https://api.beds24.com/v2";
const refreshToken = (process.env.BEDS24_REFRESH_TOKEN || "").trim();
const map = JSON.parse(readFileSync(new URL("../functions/villa-map.json", import.meta.url), "utf8"));
const OUT = new URL("../public/live/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const from = iso(new Date());
const to = addDays(from, 365);

async function get(path, headers) {
  const res = await fetch(API + path, { headers: { accept: "application/json", ...headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(`${path.split("?")[0]} -> ${res.status} ${body.error || ""}`);
  return body;
}

if (!refreshToken) { console.log("no Beds24 key yet: nothing synced"); process.exit(0); }
const { token } = await get("/authentication/token", { refreshToken });

let written = 0;
for (const [slug, v] of Object.entries(map)) {
  if (!v.propertyId || !v.roomIds?.length) continue;
  try {
    const q = (extra) => new URLSearchParams([...v.roomIds.map((r) => ["roomId", String(r)]), ["startDate", from], ["endDate", to], ...extra]);
    const av = await get("/inventory/rooms/availability?" + q([]), { token });
    const cal = await get("/inventory/rooms/calendar?" + q([["includePrices", "true"], ["includeMinStay", "true"]]), { token });
    const rooms = v.roomIds.map((id) => ({
      avail: (av.data || []).find((r) => r.roomId == id)?.availability || {},
      ranges: (cal.data || []).find((r) => r.roomId == id)?.calendar || [],
    }));
    const free = [], price = {}, minStay = {};
    for (let d = from; d <= to; d = addDays(d, 1)) {
      if (rooms.every((r) => r.avail[d] === true)) free.push(d);
      let sum = 0, min = 0, priced = true;
      for (const r of rooms) {
        const range = r.ranges.find((c) => c.from <= d && d <= (c.to || c.from));
        const p = Number(range?.price1);
        if (!(p > 0)) priced = false; else sum += p;
        min = Math.max(min, Number(range?.minStay) || 0);
      }
      if (priced) price[d] = Math.round(sum * 100) / 100;
      if (min > 1) minStay[d] = min;
    }
    const single = v.roomIds.length === 1;
    const file = {
      updated: new Date().toISOString(),
      currency: v.currency || "USD",
      free, price, minStay,
      // bookOnline: true only once the Beds24 booking page is switched on for this property.
      book: single && v.bookOnline ? { base: v.bookingBase || "https://beds24.com/booking2.php", propertyId: v.propertyId, roomId: v.roomIds[0] } : null,
    };
    writeFileSync(new URL(slug + ".json", OUT), JSON.stringify(file));
    written++;
    console.log(`${slug}: ${free.length} free nights, ${Object.keys(price).length} priced`);
  } catch (e) {
    console.log(`${slug}: skipped (${e.message})`);
  }
}
console.log(`synced ${written} villas`);
