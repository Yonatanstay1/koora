// Booking-request flow QA on the real published site (GitHub Actions only).
// The email send is intercepted: the office inbox gets NOTHING from this test.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const SITE = process.env.SITE || "https://yonatanstay1.github.io/koora";
const OUT = "shots/booking";
mkdirSync(OUT, { recursive: true });
const add = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const live = await (await fetch(`${SITE}/live/casa-jolu.json`)).json();
const free = new Set(live.free);
// a free stretch that satisfies the minimum stay
let A, D;
for (const d of live.free.slice(20)) {
  const n = Math.max(3, live.minStay?.[d] || 1);
  if (Array.from({ length: n }, (_, i) => add(d, i)).every((x) => free.has(x) && live.price[x] > 0)) { A = d; D = add(d, n); break; }
}
const bookedDay = Array.from({ length: 200 }, (_, i) => add(live.free[0], i)).find((d) => !free.has(d));
const shortDay = live.free.find((d) => (live.minStay?.[d] || 1) > 1 && free.has(add(d, 1)));
const log = { A, D, bookedDay, shortDay, sent: [], checks: {} };
const b = await chromium.launch();
for (const [dev, vp, mobile] of [["phone", { width: 390, height: 844 }, true], ["desk", { width: 1440, height: 900 }, false]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  let mode = "ok";
  await p.route("**/formsubmit.co/**", async (r) => {
    log.sent.push(JSON.parse(r.request().postData() || "{}"));
    if (mode === "fail") return r.abort();
    return r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' });
  });
  const shot = (n) => p.screenshot({ path: `${OUT}/${dev}-${n}.jpg`, fullPage: n.startsWith("full"), type: "jpeg", quality: 60 });
  const panel = p.locator("#inquire");
  // 1. Search by dates on the stays page
  await p.goto(`${SITE}/villas/?arrive=${A}&depart=${D}&guests=2`, { waitUntil: "load" });
  await p.getByText(/stays? free/).first().waitFor({ timeout: 20000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(500);
  await shot("view-0-results");
  log.checks[dev + "-search"] = (await p.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 700);
  await shot("full-1-search");
  // 2. Open Casa Jolu from the results: dates carried over, price shown
  await p.goto(`${SITE}/villas/casa-jolu/?arrive=${A}&depart=${D}&guests=2`, { waitUntil: "load" });
  await panel.getByText("Request to book").waitFor();
  await p.waitForTimeout(2000);
  await shot("view-a-villa-top"); // what the guest sees first: bottom bar with dates
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35));
  await p.waitForTimeout(600);
  await shot("view-b-villa-mid");
  await panel.scrollIntoViewIfNeeded();
  await panel.screenshot({ path: `${OUT}/${dev}-2-villa-dates.jpg`, type: "jpeg", quality: 60 });
  // 3. Details step: try empty submit first
  await panel.getByRole("button", { name: /Request to book/ }).click();
  await panel.getByText("Send booking request").waitFor();
  await p.waitForTimeout(800);
  await shot("view-c-details-top");
  await panel.getByRole("button", { name: /Send booking request/ }).click();
  log.checks[dev + "-emptyBlocked"] = await p.evaluate(() => [...document.querySelectorAll("#inquire :invalid")].length);
  await panel.getByLabel("Your name").fill("QA Test Guest");
  await panel.getByLabel("Email").fill("qa@example.com");
  await panel.getByLabel("Phone / WhatsApp").fill("+1 555 000 0000");
  await panel.getByLabel("Phone / WhatsApp").focus();
  await p.waitForTimeout(400);
  await shot("view-d-typing");
  await panel.screenshot({ path: `${OUT}/${dev}-3-details.jpg`, type: "jpeg", quality: 60 });
  // 4. Send failure -> WhatsApp fallback keeps the details
  mode = "fail";
  await panel.getByRole("button", { name: /Send booking request/ }).click();
  await panel.getByText("Send on WhatsApp").waitFor({ timeout: 30000 });
  log.checks[dev + "-fallbackHref"] = decodeURIComponent(await panel.getByText("Send on WhatsApp").getAttribute("href"));
  await panel.screenshot({ path: `${OUT}/${dev}-4-send-failed.jpg`, type: "jpeg", quality: 60 });
  // 5. Success
  mode = "ok";
  await panel.getByRole("button", { name: /Send booking request/ }).click();
  await panel.getByText("Request sent.").waitFor({ timeout: 30000 });
  await panel.getByText("Request sent.").scrollIntoViewIfNeeded();
  await shot("view-e-sent");
  await panel.screenshot({ path: `${OUT}/${dev}-5-sent.jpg`, type: "jpeg", quality: 60 });
  // 6. Booked dates -> blocked, link to free homes
  if (bookedDay) {
    await p.goto(`${SITE}/villas/casa-jolu/?arrive=${add(bookedDay, -1)}&depart=${add(bookedDay, 2)}&guests=2`, { waitUntil: "load" });
    await p.waitForTimeout(2500);
    log.checks[dev + "-booked"] = (await panel.innerText()).replace(/\s+/g, " ").slice(0, 500);
    log.checks[dev + "-bookedButtonDisabled"] = await panel.getByRole("button", { name: /Request to book/ }).isDisabled();
    await panel.screenshot({ path: `${OUT}/${dev}-6-booked.jpg`, type: "jpeg", quality: 60 });
  }
  // 7. Too short for the minimum stay
  if (shortDay) {
    await p.goto(`${SITE}/villas/casa-jolu/?arrive=${shortDay}&depart=${add(shortDay, 1)}&guests=2`, { waitUntil: "load" });
    await p.waitForTimeout(2500);
    log.checks[dev + "-minstay"] = (await panel.innerText()).replace(/\s+/g, " ").slice(0, 500);
    await panel.screenshot({ path: `${OUT}/${dev}-7-minstay.jpg`, type: "jpeg", quality: 60 });
  }
  // 8. No dates yet
  await p.goto(`${SITE}/villas/casa-jolu/`, { waitUntil: "load" });
  await p.waitForTimeout(2000);
  await panel.getByRole("button", { name: /Request to book/ }).click();
  await p.waitForTimeout(500);
  log.checks[dev + "-nodates"] = (await panel.locator("[role=alert]").allInnerTexts()).join(" | ");
  log.checks[dev + "-errors"] = errs;
  await ctx.close();
}
await b.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify(log, null, 1));
console.log(JSON.stringify(log, null, 1).slice(0, 4000));
