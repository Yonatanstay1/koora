// Preview the exported site (out/) with a FAKE Beds24 behind /api/beds24, so the
// live calendar can be reviewed before Koora's real account is connected.
//   npm run build && node scripts/preview-live.cjs   -> http://127.0.0.1:4310
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { createBridge, createHandler, addDays } = require("../functions/beds24.cjs");

const ROOT = path.join(__dirname, "..", "out");
const PORT = Number(process.env.PORT || 4310);
const MAP = {
  "casa-ficus": { propertyId: 1, roomIds: [11] },
  "casa-la-onda-ultra-suite": { propertyId: 2, roomIds: [21, 22] },
  "santa-teresa-tree-house-1": { propertyId: 3, roomIds: [31] },
};
const RATE = { 11: 380, 21: 1000, 22: 300, 31: 120 };

// Deterministic fake bookings: a few booked stretches every month.
function booked(roomId, iso) {
  const day = Number(iso.slice(8));
  const salt = Number(roomId) % 7;
  return (day + salt) % 11 < 3 || (day > 20 && day < 24 && roomId !== 31);
}

async function fakeFetch(url) {
  const u = new URL(url);
  const ok = (body) => ({ ok: true, status: 200, json: async () => body });
  if (u.pathname.endsWith("/authentication/token")) return ok({ token: "fake", expiresIn: 86400 });
  const ids = u.searchParams.getAll("roomId");
  if (u.pathname.endsWith("/availability")) {
    const from = u.searchParams.get("startDate");
    const to = u.searchParams.get("endDate");
    return ok({
      success: true,
      data: ids.map((id) => {
        const availability = {};
        for (let d = from; d <= to; d = addDays(d, 1)) availability[d] = !booked(id, d);
        return { roomId: Number(id), availability };
      }),
    });
  }
  if (u.pathname.endsWith("/offers")) {
    const a = u.searchParams.get("arrival");
    const b = u.searchParams.get("departure");
    const nights = Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
    return ok({
      success: true,
      data: ids.map((id) => ({
        roomId: Number(id),
        offers: nights < 2 ? [] : [{ offerId: 1, price: RATE[id] * nights + 150, unitsAvailable: 1 }],
      })),
    });
  }
  return { ok: false, status: 404, json: async () => ({}) };
}

const api = createHandler(createBridge({ refreshToken: "fake", villaMap: MAP, fetchImpl: fakeFetch }));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain", ".mp4": "video/mp4", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon" };

http
  .createServer((req, res) => {
    if (req.url.startsWith("/api/beds24/")) return api(req, res);
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
    if (!fs.existsSync(file)) return res.writeHead(404).end("not found");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, "127.0.0.1", () => console.log(`preview with fake Beds24: http://127.0.0.1:${PORT}`));
