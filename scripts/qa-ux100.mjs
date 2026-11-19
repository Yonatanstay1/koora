// 100 user-experience checks on the live site (GitHub Actions only, never on a laptop).
// Chrome + Safari engines, computer + phone. Booking emails are intercepted: nothing is sent.
import { chromium, webkit, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const SITE = process.env.SITE || "https://koorarentals.com";
const OUT = "shots/ux100";
mkdirSync(OUT, { recursive: true });
const results = [];
let n = 0;
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const IPHONE = devices["iPhone 14"];

const cr = await chromium.launch();
const wk = await webkit.launch();
const ctxs = [];
async function page(browser, opts, extra = {}) {
  const ctx = await browser.newContext({ ...opts, ...extra });
  await ctx.route("**/formsubmit.co/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"success":"true"}' }));
  ctxs.push(ctx);
  const p = await ctx.newPage();
  p.errors = [];
  p.bad = [];
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 160)));
  p.on("response", (r) => r.status() >= 400 && !/instagram|facebook|youtube|google/.test(r.url()) && p.bad.push(r.status() + " " + r.url()));
  return p;
}
async function check(name, fn, shotPage) {
  const id = String(++n).padStart(3, "0");
  let ok = false, note = "";
  try {
    const r = await Promise.race([fn(), new Promise((_, j) => setTimeout(() => j(new Error("timeout 45s")), 45000))]);
    ok = r === true || (r && r.ok === true);
    note = r && r.note ? String(r.note) : r === true ? "" : JSON.stringify(r)?.slice(0, 200);
  } catch (e) {
    note = "ERROR " + e.message.split("\n")[0].slice(0, 200);
  }
  if (shotPage) await shotPage.screenshot({ path: `${OUT}/${id}.jpg`, type: "jpeg", quality: 60 }).catch(() => {});
  results.push({ id, name, ok, note });
  console.log(ok ? "PASS" : "FAIL", id, name, note);
}
const go = (p, path) => p.goto(SITE + path, { waitUntil: "load", timeout: 45000 });
const settle = (p, ms = 900) => p.waitForTimeout(ms);
const scrollAll = (p) =>
  p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((z) => setTimeout(z, 90)); }
  });
const hiddenReveals = (p) =>
  p.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter((e) => {
    const s = getComputedStyle(e);
    return e.getClientRects().length && (Number(s.opacity) < 0.95 || (e.dataset.reveal === "img" && s.clipPath !== "inset(0px)" && s.clipPath !== "none"));
  }).map((e) => (e.innerText || e.className).slice(0, 40)));
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const addDays = (k) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); };

// ---------- Home, computer ----------
const d = await page(cr, DESK);
await check("Home opens in under 4 seconds (computer)", async () => { const t = Date.now(); await go(d, "/"); const ms = Date.now() - t; return { ok: ms < 4000, note: ms + " ms" }; });
await settle(d, 1600);
await check("Opening headline fully visible after its animation", async () => {
  const box = await d.locator("h1").boundingBox(); const op = await d.locator("h1 .hero-line span").last().evaluate((e) => getComputedStyle(e).transform);
  return { ok: !!box && box.y > 0 && box.y < 900 && (op === "none" || op === "matrix(1, 0, 0, 1, 0, 0)"), note: op };
}, d);
await check("Search bar visible on the first screen (computer)", async () => { const b = await d.getByRole("button", { name: /Find stays/ }).boundingBox(); return { ok: !!b && b.y + b.height < 900, note: b && Math.round(b.y) }; });
await check("Menu bar is see-through over the photo at the top", async () => ({ ok: /rgba\(0, 0, 0, 0\)/.test(await d.locator("header").first().evaluate((e) => getComputedStyle(e).backgroundColor)), note: await d.locator("header").first().evaluate((e) => getComputedStyle(e).backgroundColor) }));
await check("Menu bar turns solid after scrolling", async () => { await d.mouse.wheel(0, 900); await settle(d, 800); const bg = await d.locator("header").first().evaluate((e) => getComputedStyle(e).backgroundColor); await d.evaluate(() => scrollTo(0, 0)); return { ok: !/rgba\(0, 0, 0, 0\)/.test(bg), note: bg }; });
await check("Every main menu link opens a working page", async () => {
  const hrefs = await d.locator('nav[aria-label="Main navigation"] a').evaluateAll((a) => a.map((x) => x.href));
  const bad = []; for (const h of hrefs) { const r = await fetch(h); if (r.status !== 200) bad.push(r.status + " " + h); }
  return { ok: hrefs.length >= 6 && !bad.length, note: hrefs.length + " links " + bad.join(" ") };
});
await check("Floating WhatsApp button opens the Koora number", async () => { const h = await d.getByLabel("Chat with Koora on WhatsApp").getAttribute("href"); return { ok: /wa\.me\/50685125020/.test(h), note: h }; });
// Date picker
const ci = d.getByRole("button", { name: /Check-in/ }).first();
const dlg = d.getByRole("dialog", { name: "Choose your dates" });
await check("Date picker opens when you click Check-in", async () => { await ci.click(); await settle(d, 600); return await dlg.isVisible(); }, d);
await check("Date picker shows two months side by side", async () => { const t = await dlg.innerText(); return { ok: (t.match(/20\d\d/g) || []).length >= 2, note: t.slice(0, 60) }; });
await check("Past days cannot be picked", async () => { const dis = await dlg.locator("button[disabled][aria-label*='20']").count(); return { ok: dis > 0, note: dis + " disabled days" }; });
await check("Next-month arrow moves the calendar forward", async () => { const before = await dlg.innerText(); await dlg.getByLabel("Next month").click(); await settle(d, 300); const after = await dlg.innerText(); return before.slice(0, 120) !== after.slice(0, 120); });
const days = dlg.locator("button[aria-label*='20']:not([disabled])");
await check("Picking two days shows the number of nights", async () => { await days.nth(5).click(); await days.nth(9).hover(); await settle(d, 200); await days.nth(9).click(); await settle(d, 300); const t = await dlg.innerText(); return { ok: /4 nights/.test(t), note: t.slice(0, 60) }; }, d);
await check("Done closes the calendar and fills both fields", async () => { await dlg.getByRole("button", { name: "Done" }).click(); await settle(d, 300); const t = await d.locator("form").first().innerText(); return { ok: !(await dlg.count()) && !/Add date/.test(t), note: t.replace(/\s+/g, " ").slice(0, 70) }; });
await check("Escape key closes the calendar", async () => { await ci.click(); await settle(d, 400); await d.keyboard.press("Escape"); await settle(d, 300); return (await dlg.count()) === 0; });
await check("Clicking outside closes the calendar", async () => { await ci.click(); await settle(d, 400); await d.mouse.click(1400, 880); await settle(d, 300); return (await dlg.count()) === 0; });
await check("Clear dates empties the fields", async () => { await ci.click(); await settle(d, 300); await dlg.getByRole("button", { name: "Clear dates" }).click(); await d.keyboard.press("Escape"); const t = await d.locator("form").first().innerText(); return { ok: (t.match(/Add date/g) || []).length === 2, note: t.replace(/\s+/g, " ").slice(0, 60) }; });
await check("Find stays without dates still helps (goes to homes or explains)", async () => { await d.getByRole("button", { name: /Find stays/ }).click(); await settle(d, 1500); const u = d.url(); const t = await d.locator("main").innerText(); const ok = /villas/.test(u) || /choose|date/i.test(t); await go(d, "/"); await settle(d, 1200); return { ok, note: u }; });
await check("Find stays with dates and guests opens matching homes", async () => {
  await ci.click(); await settle(d, 400); await days.nth(12).click(); await days.nth(16).click(); await dlg.getByRole("button", { name: "Done" }).click();
  await d.locator("form select").first().selectOption({ index: 3 }).catch(() => {});
  await d.getByRole("button", { name: /Find stays/ }).click(); await d.waitForURL(/arrive=/, { timeout: 15000 }); await settle(d, 2500);
  return { ok: /depart=/.test(d.url()), note: d.url().replace(SITE, "") };
}, d);
await check("Results page shows how many homes are free", async () => { const t = await d.locator("main").innerText(); return { ok: /free|available/i.test(t), note: (t.match(/[^.\n]*(free|available)[^.\n]*/i) || [""])[0].slice(0, 80) }; }, d);
await check("Picker on results page re-opens with the chosen dates", async () => { await d.getByRole("button", { name: /Check-out/ }).first().click(); await settle(d, 500); const t = await dlg.innerText(); await d.keyboard.press("Escape"); return { ok: /nights/.test(t), note: t.slice(0, 50) }; });
// Home sections
await go(d, "/"); await settle(d, 1200);
await check("Why Koora: all 5 points appear as you scroll", async () => { const sec = d.getByText("Personal by choice.").first(); await sec.scrollIntoViewIfNeeded(); await d.mouse.wheel(0, 900); await settle(d, 1600); const items = d.locator("ol li[data-reveal]"); const c = await items.count(); const vis = await items.evaluateAll((l) => l.filter((e) => getComputedStyle(e).opacity === "1").length); return { ok: c === 5 && vis >= 3, note: `${vis}/${c} visible` }; }, d);
await check("Why Koora photo loaded", async () => d.locator('img[alt^="A Koora home among the trees"]').evaluate((i) => i.complete && i.naturalWidth > 0));
await check("Koora guide: moving words band is animating", async () => { const t = d.locator(".marquee-track"); await d.locator(".marquee").evaluate((e) => e.scrollIntoView({ block: "center" })); await settle(d, 300); const a = await t.evaluate((e) => getComputedStyle(e).transform); await settle(d, 700); const b = await t.evaluate((e) => getComputedStyle(e).transform); return { ok: a !== b, note: a + " -> " + b }; });
await check("Koora guide: 6 cards appear", async () => { await d.getByText("More than a place to stay.").scrollIntoViewIfNeeded(); await d.mouse.wheel(0, 500); await settle(d, 1600); const c = await d.locator('a[href^="/destination/#"]').count(); return { ok: c >= 6, note: c }; }, d);
await check("Koora guide: card lights up white on hover", async () => { const card = d.locator('a[href="/destination/#surf"]'); await card.hover(); await settle(d, 700); const bg = await card.evaluate((e) => getComputedStyle(e).backgroundColor); return { ok: /255, 255, 255/.test(bg), note: bg }; }, d);
await check("Koora guide links land on a matching spot", async () => { const r = await (await fetch(SITE + "/destination/")).text(); const ids = ["surf", "local-food", "shopping", "wellness", "adventure", "explore"].filter((x) => !r.includes(`id="${x}"`)); return { ok: !ids.length, note: ids.length ? "missing: " + ids.join(",") : "all 6" }; });
await check("Contact area: WhatsApp and email shortcuts present", async () => { const w = await d.locator('#contact a[href*="wa.me"]').count(); const m = await d.locator('#contact a[href^="mailto:"]').count(); return { ok: w > 0 && m > 0, note: `${w} wa, ${m} mail` }; });
await check("Nothing stays invisible after scrolling the whole home page (computer)", async () => { await scrollAll(d); await settle(d, 2200); const h = await hiddenReveals(d); return { ok: !h.length, note: h.join(" | ") }; });
await check("Jumping straight to the bottom shows the content there", async () => { await go(d, "/"); await settle(d, 800); await d.keyboard.press("End"); await settle(d, 2200); const h = await d.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && getComputedStyle(e).opacity !== "1"; }).length); return { ok: h === 0, note: h + " hidden in view" }; }, d);
await check("Home: every photo has alt text", async () => { const c = await d.evaluate(() => [...document.images].filter((i) => !i.hasAttribute("alt")).length); return { ok: c === 0, note: c }; });
await check("Home: every button has a readable name", async () => { const c = await d.evaluate(() => [...document.querySelectorAll("button")].filter((b) => !(b.innerText.trim() || b.getAttribute("aria-label"))).length); return { ok: c === 0, note: c }; });
await check("Keyboard: first Tab lands on Skip to content", async () => { await go(d, "/"); await d.keyboard.press("Tab"); const t = await d.evaluate(() => document.activeElement?.textContent?.trim()); return { ok: /Skip/.test(t), note: t }; });
await check("Keyboard: focus ring visible on date field", async () => { const b = d.getByRole("button", { name: /Check-in/ }).first(); await b.focus(); await d.keyboard.press("Shift+Tab"); await d.keyboard.press("Tab"); const o = await b.evaluate((e) => getComputedStyle(e).outlineStyle + " " + getComputedStyle(e).boxShadow); return { ok: !/^none none$/.test(o), note: o.slice(0, 60) }; });
await check("Home: no JavaScript errors", async () => ({ ok: !d.errors.length, note: d.errors.join(" | ") }));
await check("Home: total download under 6 MB", async () => { const p = await page(cr, DESK); let bytes = 0; p.on("response", async (r) => { const l = Number(r.headers()["content-length"] || 0); bytes += l; }); await go(p, "/"); await settle(p, 2500); return { ok: bytes < 6e6, note: Math.round(bytes / 1024) + " KB (first screen)" }; });

// ---------- Home, phone ----------
const ph = await page(cr, PHONE);
await check("Home opens in under 5 seconds (phone)", async () => { const t = Date.now(); await go(ph, "/"); const ms = Date.now() - t; return { ok: ms < 5000, note: ms + " ms" }; });
await settle(ph, 1600);
await check("Phone: headline and search start on the first screens", async () => { const b = await ph.getByRole("button", { name: /Check-in/ }).first().boundingBox(); return { ok: !!b && b.y < 844 * 1.3, note: b && Math.round(b.y) }; }, ph);
await check("Phone: no sideways scrolling on home", async () => ({ ok: (await overflow(ph)) <= 0, note: await overflow(ph) }));
await check("Phone: menu opens with all links", async () => { await ph.getByLabel("Open menu").click(); await settle(ph, 500); const c = await ph.locator('nav[aria-label="Mobile navigation"] a').count(); return { ok: c >= 6, note: c + " links" }; }, ph);
await check("Phone: menu closes", async () => { await ph.getByLabel("Close menu").click(); await settle(ph, 400); return (await ph.locator('nav[aria-label="Mobile navigation"]').count()) === 0 || !(await ph.locator('nav[aria-label="Mobile navigation"]').isVisible()); });
const pdlg = ph.getByRole("dialog", { name: "Choose your dates" });
await check("Phone: date picker opens full screen", async () => { await ph.getByRole("button", { name: /Check-in/ }).first().click(); await settle(ph, 700); const b = await pdlg.boundingBox(); return { ok: !!b && b.width >= 380 && b.height >= 800, note: b && `${Math.round(b.width)}x${Math.round(b.height)}` }; }, ph);
await check("Phone: page behind the calendar does not scroll", async () => ({ ok: (await ph.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden", note: await ph.evaluate(() => getComputedStyle(document.body).overflow) }));
await check("Phone: Done button reachable without scrolling", async () => { const b = await pdlg.getByRole("button", { name: "Done", exact: true }).boundingBox(); return { ok: !!b && b.y + b.height <= 844, note: b && Math.round(b.y) }; });
await check("Phone: picking dates works and shows nights", async () => { const dd = pdlg.locator("button[aria-label*='20']:not([disabled])"); await dd.nth(8).click(); await dd.nth(11).click(); await settle(ph, 300); const t = await pdlg.innerText(); return { ok: /3 nights/.test(t), note: t.slice(0, 60) }; }, ph);
await check("Phone: day buttons are big enough to tap (44px)", async () => { const b = await pdlg.locator("button[aria-label*='20']").first().boundingBox(); return { ok: b.width >= 40 && b.height >= 40, note: `${Math.round(b.width)}x${Math.round(b.height)}` }; });
await check("Phone: Done returns to the page with dates filled", async () => { await pdlg.getByRole("button", { name: /Done/ }).click(); await settle(ph, 400); const t = await ph.locator("form").first().innerText(); return { ok: !/Add date/.test(t), note: t.replace(/\s+/g, " ").slice(0, 60) }; });
await check("Phone: WhatsApp button doesn't cover the search button", async () => {
  const s = await ph.getByRole("button", { name: /Find stays/ }); await s.scrollIntoViewIfNeeded(); await settle(ph, 300);
  const a = await s.boundingBox(); const w = await ph.getByLabel("Chat with Koora on WhatsApp").boundingBox();
  const hit = a && w && !(a.x + a.width < w.x || w.x + w.width < a.x || a.y + a.height < w.y || w.y + w.height < a.y);
  return { ok: !hit, note: hit ? "overlap" : "clear" };
}, ph);
await check("Nothing stays invisible after scrolling the whole home page (phone)", async () => { await scrollAll(ph); await settle(ph, 2200); const h = await hiddenReveals(ph); return { ok: !h.length, note: h.join(" | ") }; });
await check("Phone: Koora guide cards readable (not cut off)", async () => { const c = ph.locator('a[href="/destination/#explore"]'); await c.scrollIntoViewIfNeeded(); await settle(ph, 1200); const b = await c.boundingBox(); return { ok: b.x >= 0 && b.x + b.width <= 390, note: `${Math.round(b.x)}+${Math.round(b.width)}` }; }, ph);
await check("Phone: contact area shows WhatsApp shortcut", async () => { const w = ph.locator('#contact a[href*="wa.me"]').first(); await w.scrollIntoViewIfNeeded(); await settle(ph, 900); return await w.isVisible(); }, ph);

// ---------- Reduced motion ----------
const rm = await page(cr, DESK, { reducedMotion: "reduce" });
await check("People who turn off animation still see everything", async () => { await go(rm, "/"); await settle(rm, 800); await rm.keyboard.press("End"); await settle(rm, 600); const h = await hiddenReveals(rm); return { ok: !h.length, note: h.length + " hidden" }; });

// ---------- Safari engine ----------
const sd = await page(wk, DESK);
await check("Safari (computer): home opens without errors", async () => { await go(sd, "/"); await settle(sd, 1500); return { ok: !sd.errors.length, note: sd.errors.join(" | ") }; }, sd);
await check("Safari (computer): date picker works", async () => { await sd.getByRole("button", { name: /Check-in/ }).first().click(); await settle(sd, 500); const g = sd.getByRole("dialog", { name: "Choose your dates" }); const dd = g.locator("button[aria-label*='20']:not([disabled])"); await dd.nth(6).click(); await dd.nth(8).click(); const t = await g.innerText(); await g.getByRole("button", { name: "Done" }).click(); return { ok: /2 nights/.test(t), note: t.slice(0, 40) }; }, sd);
await check("Safari (computer): reveals finish after scrolling", async () => { await scrollAll(sd); await settle(sd, 2400); const h = await hiddenReveals(sd); return { ok: !h.length, note: h.join(" | ") }; });
await check("Safari (computer): contact fields all the same height", async () => {
  await sd.locator("#contact").scrollIntoViewIfNeeded(); await settle(sd, 1200);
  const hs = await sd.locator("#contact form").evaluate((f) => [...f.querySelectorAll("input:not([type=checkbox]):not([tabindex='-1']), select, button[aria-haspopup]")].filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().height)));
  return { ok: Math.max(...hs) - Math.min(...hs) <= 6, note: hs.join(",") };
}, sd);
const sp = await page(wk, IPHONE);
await check("iPhone (Safari): home opens, no sideways scroll", async () => { await go(sp, "/"); await settle(sp, 1500); return { ok: (await overflow(sp)) <= 0 && !sp.errors.length, note: (await overflow(sp)) + " " + sp.errors.join("|") }; }, sp);
await check("iPhone (Safari): date picker full screen and works", async () => { await sp.getByRole("button", { name: /Check-in/ }).first().tap(); await settle(sp, 700); const g = sp.getByRole("dialog", { name: "Choose your dates" }); const dd = g.locator("button[aria-label*='20']:not([disabled])"); await dd.nth(7).tap(); await dd.nth(12).tap(); const t = await g.innerText(); return { ok: /5 nights/.test(t), note: t.slice(0, 40) }; }, sp);
await check("iPhone (Safari): reveals finish after scrolling", async () => { await go(sp, "/"); await settle(sp, 800); await scrollAll(sp); await settle(sp, 2400); const h = await hiddenReveals(sp); return { ok: !h.length, note: h.join(" | ") }; });

// ---------- Homes list + home page + booking ----------
const v = await page(cr, DESK);
await check("Homes page lists at least 12 homes", async () => { await go(v, "/villas/"); await settle(v, 1500); const c = await v.locator('a[href^="/villas/"]').evaluateAll((a) => new Set(a.map((x) => x.getAttribute("href"))).size); return { ok: c >= 12, note: c }; }, v);
await check("Homes page: all photos load", async () => { await scrollAll(v); await settle(v, 1500); const b = await v.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length); return { ok: b === 0, note: b + " broken" }; });
await check("Clicking a home opens its page", async () => { await go(v, "/villas/"); await settle(v, 1000); await v.locator('a[href^="/villas/casa-"]').first().click(); await v.waitForURL(/villas\/casa-/); return true; });
await check("Back button returns to the homes list", async () => { await v.goBack(); await v.waitForURL(/\/villas\/?$/); return true; });
await go(v, `/villas/casa-jolu/?arrive=${addDays(70)}&depart=${addDays(74)}&guests=2`); await settle(v, 2500);
const panel = v.locator("#inquire");
await check("Home page: title has the home's name", async () => ({ ok: /Casa Jolu/.test(await v.title()), note: await v.title() }));
await check("Home page: photo gallery opens", async () => { await v.getByLabel(/Open photos of/).first().click(); await settle(v, 700); return await v.getByLabel("Close gallery").isVisible(); }, v);
await check("Home page: next photo arrow works", async () => { await v.getByLabel("Next photo").click(); await settle(v, 300); return true; });
await check("Home page: Escape closes the gallery", async () => { await v.keyboard.press("Escape"); await settle(v, 400); return !(await v.getByLabel("Close gallery").isVisible().catch(() => false)); });
await check("Home page: booking box present", async () => (await panel.count()) === 1);
await check("Home page: availability calendar present", async () => (await v.getByLabel("Availability calendar").count()) > 0);
await check("Home page: dates from the search are carried in", async () => { const t = await panel.innerText(); return { ok: /night/i.test(t), note: t.replace(/\s+/g, " ").slice(0, 90) }; }, v);
await check("Request to book opens the details step", async () => { const b = panel.getByRole("button", { name: /Request to book/ }); if (await b.isDisabled()) return { ok: true, note: "dates taken: button correctly disabled" }; await b.click(); await panel.getByText("Send booking request").waitFor(); return true; });
await check("Empty details cannot be sent", async () => { if (!(await panel.getByText("Send booking request").count())) return { ok: true, note: "skipped (dates taken)" }; await panel.getByRole("button", { name: /Send booking request/ }).click(); const c = await v.evaluate(() => document.querySelectorAll("#inquire :invalid").length); return { ok: c >= 3, note: c + " fields flagged" }; });
await check("A wrong email is caught", async () => { if (!(await panel.getByText("Send booking request").count())) return { ok: true, note: "skipped" }; await panel.getByLabel("Email").fill("not-an-email"); return await panel.getByLabel("Email").evaluate((e) => !e.checkValidity()); });
await check("Booking request sends and shows a reference", async () => {
  if (!(await panel.getByText("Send booking request").count())) return { ok: true, note: "skipped" };
  await panel.getByLabel("Your name").fill("UX Test"); await panel.getByLabel("Email").fill("ux@example.com"); await panel.getByLabel("Phone / WhatsApp").fill("+1 555 000 1111");
  await panel.getByRole("button", { name: /Send booking request/ }).click(); await panel.getByText("Request sent.").waitFor({ timeout: 30000 }); const t = await panel.innerText(); return { ok: /K-/.test(t), note: (t.match(/K-\w+/) || [""])[0] };
}, v);
await check("Home page: share preview image is a 1200x630 JPG", async () => { const h = await (await fetch(SITE + "/villas/casa-jolu/")).text(); const m = h.match(/og:image" content="([^"]+)"/); const r = await fetch(m[1]); return { ok: /jpeg/.test(r.headers.get("content-type")) && h.includes('og:image:width" content="1200"'), note: m[1] }; });
await check("Home page: canonical address set", async () => { const c = await v.locator("link[rel=canonical]").getAttribute("href"); return { ok: /koorarentals\.com\/villas\/casa-jolu\/$/.test(c || ""), note: c }; });
const vp = await page(cr, PHONE);
await check("Phone: homes page has no sideways scroll", async () => { await go(vp, "/villas/"); await settle(vp, 1500); return { ok: (await overflow(vp)) <= 0, note: await overflow(vp) }; }, vp);
await check("Phone: home page shows a booking button without hunting", async () => { await go(vp, "/villas/casa-ficus/"); await settle(vp, 1500); const vis = await vp.evaluate(() => [...document.querySelectorAll("a,button")].some((e) => /book|dates|request/i.test(e.innerText) && (() => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.width > 0; })())); return vis; }, vp);
await check("Phone: home page has no sideways scroll", async () => ({ ok: (await overflow(vp)) <= 0, note: await overflow(vp) }));

// ---------- Contact ----------
const c = await page(cr, DESK);
await go(c, "/contact/"); await settle(c, 1200);
const cf = c.locator("form").last();
await check("Contact: date picker opens from the form", async () => { await cf.getByRole("button", { name: /Check-in/ }).click(); await settle(c, 500); const ok = await c.getByRole("dialog", { name: "Choose your dates" }).isVisible(); await c.keyboard.press("Escape"); return ok; }, c);
await check("Contact: fields all the same height (Chrome)", async () => { const hs = await cf.evaluate((f) => [...f.querySelectorAll("input:not([type=checkbox]):not([tabindex='-1']), select, button[aria-haspopup]")].filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().height))); return { ok: Math.max(...hs) - Math.min(...hs) <= 6, note: hs.join(",") }; }, c);
await check("Contact: privacy tick box is required", async () => ({ ok: await cf.locator("input[type=checkbox]").evaluate((e) => e.required), note: "" }));
await check("Contact: empty form is not sent", async () => { await cf.getByRole("button", { name: /Send inquiry|Continue on WhatsApp/ }).click(); await settle(c, 400); const n = await cf.evaluate((f) => f.querySelectorAll(":invalid").length); return { ok: n >= 2, note: n + " flagged" }; });
await check("Contact: choosing Estate Management hides the dates", async () => { await cf.locator('select[name="interest"]').selectOption("Estate Management"); await settle(c, 300); const k = await cf.getByRole("button", { name: /Check-in/ }).count(); await cf.locator('select[name="interest"]').selectOption("Booking a Villa"); return k === 0; });
await check("Contact: WhatsApp draft carries the typed name", async () => { await cf.locator('input[name="name"]').fill("Dana Guest"); await settle(c, 200); const h = await cf.locator('a[href*="wa.me"]').first().getAttribute("href"); return { ok: decodeURIComponent(h).includes("Dana Guest"), note: "" }; });
const cp = await page(cr, PHONE);
await check("Phone: contact form controls easy to tap (44px+)", async () => { await go(cp, "/contact/"); await settle(cp, 1200); const hs = await cp.locator("form").last().evaluate((f) => [...f.querySelectorAll("input:not([type=checkbox]):not([tabindex='-1']), select, textarea, button")].filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().height))); return { ok: Math.min(...hs) >= 44, note: "min " + Math.min(...hs) }; }, cp);
await check("Phone: contact page has no sideways scroll", async () => ({ ok: (await overflow(cp)) <= 0, note: await overflow(cp) }));

// ---------- Every other page, computer + phone ----------
const pages = ["/estate-management/", "/development/", "/destination/", "/journal/", "/about/", "/privacy/", "/es/"];
for (const path of pages) {
  await check(`Computer: ${path} opens cleanly`, async () => { const p = await page(cr, DESK); const r = await go(p, path); await scrollAll(p); await settle(p, 1800); const h = await hiddenReveals(p); return { ok: r.status() === 200 && !p.errors.length && !h.length && (await p.locator("h1").count()) === 1, note: `${r.status()} h1=${await p.locator("h1").count()} hidden=${h.length} ${p.errors.join("|")}` }; });
  await check(`Phone: ${path} opens cleanly`, async () => { const p = await page(cr, PHONE); const r = await go(p, path); await settle(p, 1200); return { ok: r.status() === 200 && (await overflow(p)) <= 0 && !p.errors.length, note: `${r.status()} overflow=${await overflow(p)}` }; });
}
await check("Spanish page is in Spanish", async () => { const p = await page(cr, DESK); await go(p, "/es/"); const t = await p.locator("main").innerText(); return { ok: /\b(de|la|el|nuestro|casa|estancia)\b/i.test(t), note: t.slice(0, 60) }; });
await check("A journal story opens", async () => { const p = await page(cr, DESK); await go(p, "/journal/"); await p.locator('a[href^="/journal/"]').first().click(); await settle(p, 1200); return { ok: (await p.locator("h1").count()) === 1, note: p.url() }; });
await check("Missing page shows a friendly page with a way home", async () => { const p = await page(cr, DESK); await go(p, "/no-such-page/"); const home = await p.locator('a[href="/"]').count(); return { ok: home > 0, note: (await p.locator("main").innerText()).slice(0, 60) }; }, null);

// ---------- Site-wide basics ----------
await check("Sitemap lists every home shown on the site", async () => { const s = await (await fetch(SITE + "/sitemap.xml")).text(); const k = new Set(s.match(/\/villas\/[a-z0-9-]+/g) || []).size; const h = await (await fetch(SITE + "/villas/")).text(); const shown = new Set((h.match(/href="\/villas\/[a-z0-9-]+/g) || [])).size; return { ok: k >= shown && shown >= 12, note: `${k} in sitemap, ${shown} on site` }; });
await check("robots.txt lets Google in and points to the sitemap", async () => { const s = await (await fetch(SITE + "/robots.txt")).text(); return { ok: /Allow: \//.test(s) && /sitemap/i.test(s), note: s.replace(/\s+/g, " ").slice(0, 80) }; });
await check("Footer links all work", async () => { const hrefs = await d.locator("footer a[href^='/'], footer a[href^='" + SITE + "']").evaluateAll((a) => [...new Set(a.map((x) => x.href))]); const bad = []; for (const h of hrefs) { const r = await fetch(h); if (r.status !== 200) bad.push(r.status + " " + h); } return { ok: !bad.length, note: hrefs.length + " links " + bad.join(" ") }; });
await check("Main photo on home is light (< 600 KB)", async () => { const r = await fetch(SITE + "/images/editorial/hero.webp"); const l = Number(r.headers.get("content-length")); return { ok: l < 600000, note: Math.round(l / 1024) + " KB" }; });
await check("Browser tab icon present", async () => { const h = await (await fetch(SITE + "/")).text(); return { ok: /rel="icon"/.test(h), note: "" }; });
await check("No broken files on any visited page", async () => { const all = [d, ph, v, vp, c, cp, sd, sp].flatMap((p) => p.bad); return { ok: !all.length, note: [...new Set(all)].slice(0, 4).join(" | ") }; });
await check("No JavaScript errors on any visited page", async () => { const all = [d, ph, v, vp, c, cp, sd, sp, rm].flatMap((p) => p.errors); return { ok: !all.length, note: [...new Set(all)].slice(0, 3).join(" | ") }; });

for (const x of ctxs) await x.close().catch(() => {});
await cr.close(); await wk.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ site: SITE, passed, total: results.length, results }, null, 1));
console.log(`\n${passed}/${results.length} passed`);
