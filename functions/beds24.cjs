"use strict";
// Koora <-> Beds24 bridge. Plain Node (no dependencies) so it can be unit tested
// against a fake Beds24 server. The Beds24 key never leaves the server.

const API_BASE = process.env.BEDS24_API_BASE || "https://api.beds24.com/v2";
const CACHE_MS = 5 * 60 * 1000;
const MAX_RANGE_DAYS = 400;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDate(s) {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function createBridge({ refreshToken, villaMap, fetchImpl = fetch, now = () => Date.now() }) {
  let access = null; // { token, expiresAt }
  const cache = new Map(); // key -> { at, value }

  async function token() {
    if (access && access.expiresAt - 60_000 > now()) return access.token;
    if (!refreshToken) throw new HttpError(503, "not_connected", "Beds24 is not connected yet.");
    const res = await fetchImpl(API_BASE + "/authentication/token", {
      headers: { refreshToken, accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.token) throw new HttpError(502, "auth_failed", "Beds24 sign-in failed.");
    access = { token: body.token, expiresAt: now() + (Number(body.expiresIn) || 3600) * 1000 };
    return access.token;
  }

  async function get(path, params) {
    const qs = new URLSearchParams();
    for (const [k, v] of params) qs.append(k, String(v));
    const url = API_BASE + path + "?" + qs.toString();
    const hit = cache.get(url);
    if (hit && now() - hit.at < CACHE_MS) return hit.value;
    let res = await fetchImpl(url, { headers: { token: await token(), accept: "application/json" } });
    if (res.status === 401) {
      access = null; // token revoked or expired early: retry once
      res = await fetchImpl(url, { headers: { token: await token(), accept: "application/json" } });
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) throw new HttpError(502, "upstream", "Beds24 did not answer.");
    cache.set(url, { at: now(), value: body });
    return body;
  }

  function villa(slug) {
    const v = villaMap[slug];
    if (!v || !v.propertyId || !Array.isArray(v.roomIds) || v.roomIds.length === 0) {
      throw new HttpError(404, "not_mapped", "This home is not linked to Beds24.");
    }
    return v;
  }

  // Nights that are free for EVERY room of the villa (combinations need all parts free).
  async function availability(slug, from, to) {
    const v = villa(slug);
    if (!isDate(from) || !isDate(to) || to <= from) throw new HttpError(400, "bad_dates", "Invalid dates.");
    if (daysBetween(from, to) > MAX_RANGE_DAYS) throw new HttpError(400, "bad_dates", "Range too long.");
    const params = [...v.roomIds.map((id) => ["roomId", id]), ["startDate", from], ["endDate", to]];
    const body = await get("/inventory/rooms/availability", params);
    const rows = Array.isArray(body.data) ? body.data : [];
    const byRoom = new Map(rows.map((r) => [String(r.roomId), r.availability || {}]));
    const free = [];
    for (let d = from; d <= to; d = addDays(d, 1)) {
      // A night counts as free only when Beds24 explicitly says so for every room.
      if (v.roomIds.every((id) => byRoom.get(String(id))?.[d] === true)) free.push(d);
    }
    return { villa: slug, from, to, free };
  }

  function bookingUrl(v, roomId, arrive, depart, guests) {
    const u = new URL(v.bookingBase || "https://beds24.com/booking2.php");
    u.searchParams.set("propid", String(v.propertyId));
    u.searchParams.set("roomid", String(roomId));
    u.searchParams.set("checkin", arrive);
    u.searchParams.set("checkout", depart);
    u.searchParams.set("numnight", String(daysBetween(arrive, depart)));
    u.searchParams.set("numadult", String(guests));
    return u.toString();
  }

  // Real price from Beds24 for these dates. Combinations are priced as the sum of
  // their rooms and are booked through the team (one Beds24 link books one room).
  async function quote(slug, arrive, depart, guests) {
    const v = villa(slug);
    if (!isDate(arrive) || !isDate(depart) || depart <= arrive) throw new HttpError(400, "bad_dates", "Invalid dates.");
    if (daysBetween(arrive, depart) > 90) throw new HttpError(400, "bad_dates", "Stay too long.");
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1 || g > 40) throw new HttpError(400, "bad_guests", "Invalid guests.");
    const params = [...v.roomIds.map((id) => ["roomId", id]), ["arrival", arrive], ["departure", depart], ["numAdults", g]];
    const body = await get("/inventory/rooms/offers", params);
    const rows = Array.isArray(body.data) ? body.data : [];
    let total = 0;
    for (const id of v.roomIds) {
      const row = rows.find((r) => String(r.roomId) === String(id));
      const offers = (row && Array.isArray(row.offers) ? row.offers : []).filter(
        (o) => Number(o.price) > 0 && (o.unitsAvailable === undefined || Number(o.unitsAvailable) > 0),
      );
      if (offers.length === 0) {
        return { villa: slug, arrive, depart, guests: g, bookable: false };
      }
      total += Math.min(...offers.map((o) => Number(o.price)));
    }
    const single = v.roomIds.length === 1;
    return {
      villa: slug,
      arrive,
      depart,
      guests: g,
      nights: daysBetween(arrive, depart),
      bookable: true,
      total: Math.round(total * 100) / 100,
      currency: v.currency || "USD",
      bookUrl: single ? bookingUrl(v, v.roomIds[0], arrive, depart, g) : null,
    };
  }

  return { availability, quote };
}

// HTTP adapter: /api/beds24/availability?villa=&from=&to=  and  /api/beds24/quote?villa=&arrive=&depart=&guests=
function createHandler(bridge) {
  return async function handler(req, res) {
    const url = new URL(req.url, "http://local");
    const q = url.searchParams;
    const send = (status, body, cacheSeconds) => {
      res.statusCode = status;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.setHeader(
        "cache-control",
        cacheSeconds ? `public, max-age=60, s-maxage=${cacheSeconds}` : "no-store",
      );
      res.end(JSON.stringify(body));
    };
    if (req.method !== "GET") return send(405, { error: "method" });
    try {
      if (url.pathname.endsWith("/availability")) {
        return send(200, await bridge.availability(q.get("villa"), q.get("from"), q.get("to")), 300);
      }
      if (url.pathname.endsWith("/quote")) {
        return send(200, await bridge.quote(q.get("villa"), q.get("arrive"), q.get("depart"), q.get("guests")), 300);
      }
      return send(404, { error: "not_found" });
    } catch (err) {
      if (err instanceof HttpError) return send(err.status, { error: err.code });
      console.error("beds24 bridge error", err && err.message);
      return send(502, { error: "upstream" });
    }
  };
}

module.exports = { createBridge, createHandler, HttpError, isDate, addDays };
