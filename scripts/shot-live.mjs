// Screenshots of the live-booking states (run in CI against scripts/preview-live.cjs).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:4310";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

function iso(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
// Find a free stretch in the fake data: try offsets until the quote is bookable.
async function findStay(page, villa, nights) {
  for (let o = 20; o < 120; o++) {
    const r = await page.request.get(`${BASE}/api/beds24/quote?villa=${villa}&arrive=${iso(o)}&depart=${iso(o + nights)}&guests=2`);
    const q = await r.json();
    const a = await (await page.request.get(`${BASE}/api/beds24/availability?villa=${villa}&from=${iso(o)}&to=${iso(o + nights)}`)).json();
    const allFree = Array.from({ length: nights }, (_, i) => iso(o + i)).every((d) => a.free.includes(d));
    if (q.bookable && allFree) return [iso(o), iso(o + nights)];
  }
  throw new Error("no free stretch");
}

async function must(page, locator, tag) {
  try {
    await locator.first().waitFor({ timeout: 15000 });
  } catch (e) {
    await page.screenshot({ path: `${OUT}/FAIL-${tag}.png`, fullPage: true });
    console.log("FAIL", tag, page.url());
    console.log("PANEL TEXT:", (await page.locator("#inquire").innerText().catch(() => "?")).replace(/\s+/g, " "));
    throw e;
  }
}

const browser = await chromium.launch();
for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && console.log("console:", m.text()));
  page.on("requestfailed", (r) => console.log("request failed:", r.url()));

  // 1. Calendar, nothing chosen
  await page.goto(`${BASE}/villas/casa-ficus`, { waitUntil: "load" });
  const panel = page.locator("#inquire");
  await panel.scrollIntoViewIfNeeded();
  await page.getByLabel("Availability calendar").waitFor();
  await panel.screenshot({ path: `${OUT}/${name}-1-calendar.png` });

  // 2. Free dates -> live price + Book now
  const [a, d] = await findStay(page, "casa-ficus", 4);
  await page.goto(`${BASE}/villas/casa-ficus?arrive=${a}&depart=${d}&guests=2`, { waitUntil: "load" });
  await must(page, page.getByText("Book now"), name + "-2");
  await page.locator("#inquire").scrollIntoViewIfNeeded();
  await page.locator("#inquire").screenshot({ path: `${OUT}/${name}-2-price-book.png` });
  const href = await page.getByText("Book now").getAttribute("href");
  console.log(name, "book link:", href);

  // 3. Booked dates chosen
  let b = null;
  for (let o = 5; o < 60 && !b; o++) {
    const av = await (await page.request.get(`${BASE}/api/beds24/availability?villa=casa-ficus&from=${iso(o)}&to=${iso(o + 3)}`)).json();
    if (av.free.length < 3) b = [iso(o), iso(o + 3)];
  }
  await page.goto(`${BASE}/villas/casa-ficus?arrive=${b[0]}&depart=${b[1]}&guests=2`, { waitUntil: "load" });
  await must(page, page.getByText("already booked"), name + "-3");
  await page.locator("#inquire").screenshot({ path: `${OUT}/${name}-3-booked.png` });

  // 4. Combination villa -> price, "Request this stay"
  const [ca, cd] = await findStay(page, "casa-la-onda-ultra-suite", 3);
  await page.goto(`${BASE}/villas/casa-la-onda-ultra-suite?arrive=${ca}&depart=${cd}&guests=4`, { waitUntil: "load" });
  await must(page, page.getByText("Request this stay"), name + "-4");
  await page.locator("#inquire").screenshot({ path: `${OUT}/${name}-4-combo.png` });

  // 5. Unlinked villa keeps the old inquiry flow
  await page.goto(`${BASE}/villas/casa-loma`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  if (await page.getByLabel("Availability calendar").count()) errors.push("unlinked villa shows calendar");
  await page.locator("#inquire").screenshot({ path: `${OUT}/${name}-5-not-linked.png` });

  // 6. Tap-to-pick in the calendar works
  await page.goto(`${BASE}/villas/santa-teresa-tree-house-1`, { waitUntil: "load" });
  const cal = page.getByLabel("Availability calendar");
  await cal.scrollIntoViewIfNeeded();
  await cal.getByRole("button", { name: "Next month" }).click();
  const freeDays = cal.locator('button[aria-label$="available"]:not([disabled])');
  await freeDays.nth(2).click();
  await freeDays.nth(4).click();
  await page.waitForTimeout(800);
  await page.locator("#inquire").screenshot({ path: `${OUT}/${name}-6-picked.png` });

  if (name === "mobile") await page.screenshot({ path: `${OUT}/mobile-7-full.png`, fullPage: false });
  if (errors.length) throw new Error(name + " errors: " + errors.join(" | "));
  await page.close();
}
await browser.close();
console.log("ok");
