"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createBridge, createHandler } = require("../functions/beds24.cjs");

const MAP = {
  ficus: { propertyId: 10, roomIds: [101] },
  onda: { propertyId: 20, roomIds: [201, 202] },
  empty: { propertyId: null, roomIds: [] },
};

function fakeBeds24({ availability = {}, offers = {}, tokenOk = true } = {}) {
  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push({ url, headers: opts.headers });
    const u = new URL(url);
    const json = (status, body) => ({ ok: status < 400, status, json: async () => body });
    if (u.pathname.endsWith("/authentication/token")) {
      return tokenOk ? json(200, { token: "T1", expiresIn: 86400 }) : json(401, { error: "bad" });
    }
    if (opts.headers.token !== "T1") return json(401, {});
    const ids = u.searchParams.getAll("roomId");
    if (u.pathname.endsWith("/inventory/rooms/availability")) {
      return json(200, { success: true, data: ids.map((id) => ({ roomId: Number(id), availability: availability[id] || {} })) });
    }
    if (u.pathname.endsWith("/inventory/rooms/offers")) {
      return json(200, { success: true, data: ids.map((id) => ({ roomId: Number(id), offers: offers[id] || [] })) });
    }
    return json(404, {});
  };
  return { fetchImpl, calls };
}

test("free nights: only dates Beds24 marks true", async () => {
  const f = fakeBeds24({ availability: { 101: { "2027-01-01": true, "2027-01-02": false, "2027-01-03": true } } });
  const b = createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl });
  const r = await b.availability("ficus", "2027-01-01", "2027-01-04");
  assert.deepEqual(r.free, ["2027-01-01", "2027-01-03"]);
  assert.equal(f.calls[0].headers.refreshToken, "R");
});

test("combination villa is free only when every room is free", async () => {
  const f = fakeBeds24({
    availability: {
      201: { "2027-01-01": true, "2027-01-02": true },
      202: { "2027-01-01": true, "2027-01-02": false },
    },
  });
  const b = createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl });
  const r = await b.availability("onda", "2027-01-01", "2027-01-02");
  assert.deepEqual(r.free, ["2027-01-01"]);
});

test("quote: cheapest offer, booking link for single room", async () => {
  const f = fakeBeds24({ offers: { 101: [{ offerId: 1, price: 1200, unitsAvailable: 1 }, { offerId: 2, price: 1100, unitsAvailable: 1 }] } });
  const b = createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl });
  const q = await b.quote("ficus", "2027-01-01", "2027-01-04", "2");
  assert.equal(q.bookable, true);
  assert.equal(q.total, 1100);
  assert.equal(q.nights, 3);
  const u = new URL(q.bookUrl);
  assert.equal(u.searchParams.get("propid"), "10");
  assert.equal(u.searchParams.get("roomid"), "101");
  assert.equal(u.searchParams.get("checkin"), "2027-01-01");
  assert.equal(u.searchParams.get("numnight"), "3");
  assert.equal(u.searchParams.get("numadult"), "2");
});

test("quote: combination sums rooms, no direct booking link", async () => {
  const f = fakeBeds24({ offers: { 201: [{ price: 1000 }], 202: [{ price: 300 }] } });
  const b = createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl });
  const q = await b.quote("onda", "2027-01-01", "2027-01-03", 4);
  assert.equal(q.total, 1300);
  assert.equal(q.bookUrl, null);
});

test("quote: no offer (booked / min stay) => not bookable", async () => {
  const f = fakeBeds24({ offers: { 201: [{ price: 1000 }] } });
  const b = createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl });
  const q = await b.quote("onda", "2027-01-01", "2027-01-03", 4);
  assert.equal(q.bookable, false);
});

test("token is reused and responses are cached", async () => {
  const f = fakeBeds24({ availability: { 101: { "2027-01-01": true } } });
  const b = createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl });
  await b.availability("ficus", "2027-01-01", "2027-01-02");
  await b.availability("ficus", "2027-01-01", "2027-01-02");
  assert.equal(f.calls.length, 2); // 1 token + 1 data
});

async function call(handler, path) {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = JSON.parse(b); } };
  await handler({ method: "GET", url: path }, res);
  return res;
}

test("http: not connected / unmapped / bad input answer cleanly", async () => {
  const f = fakeBeds24();
  const noToken = createHandler(createBridge({ refreshToken: "", villaMap: MAP, fetchImpl: f.fetchImpl }));
  assert.equal((await call(noToken, "/api/beds24/availability?villa=ficus&from=2027-01-01&to=2027-02-01")).statusCode, 503);
  const h = createHandler(createBridge({ refreshToken: "R", villaMap: MAP, fetchImpl: f.fetchImpl }));
  assert.equal((await call(h, "/api/beds24/availability?villa=empty&from=2027-01-01&to=2027-02-01")).statusCode, 404);
  assert.equal((await call(h, "/api/beds24/availability?villa=nope&from=2027-01-01&to=2027-02-01")).statusCode, 404);
  assert.equal((await call(h, "/api/beds24/availability?villa=ficus&from=2027-02-30&to=2027-03-01")).statusCode, 400);
  assert.equal((await call(h, "/api/beds24/quote?villa=ficus&arrive=2027-01-01&depart=2027-01-03&guests=0")).statusCode, 400);
  const ok = await call(h, "/api/beds24/availability?villa=ficus&from=2027-01-01&to=2027-01-05");
  assert.equal(ok.statusCode, 200);
  assert.match(ok.headers["cache-control"], /s-maxage=300/);
});

test("http: bad Beds24 login is reported, key is not leaked", async () => {
  const f = fakeBeds24({ tokenOk: false });
  const h = createHandler(createBridge({ refreshToken: "SECRET", villaMap: MAP, fetchImpl: f.fetchImpl }));
  const r = await call(h, "/api/beds24/availability?villa=ficus&from=2027-01-01&to=2027-01-05");
  assert.equal(r.statusCode, 502);
  assert.ok(!JSON.stringify(r.body).includes("SECRET"));
});
