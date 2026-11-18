// Full-site QA on the real published site (runs in GitHub Actions, never on a laptop).
// Every page, desktop + phone: screenshots, JS errors, failed requests, broken links/images,
// sideways scroll on phone, title/description/h1, tiny tap targets, missing alt text.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const SITE = process.env.SITE || "https://koorarentals.com";
const OUT = "shots/qa";
mkdirSync(OUT, { recursive: true });

const sm = await (await fetch(`${SITE}/sitemap.xml`)).text();
const paths = [...sm.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1].replace(/^\/koora/, "") || "/");
const extra = ["/404-check-page/"];
const all = [...new Set([...paths, ...extra])].map((p) => (p.endsWith("/") ? p : p + "/"));

const report = { site: SITE, pages: [], links: {} };
const linkSet = new Set();
const b = await chromium.launch();
for (const [dev, vp, mobile] of [["desk", { width: 1440, height: 900 }, false], ["phone", { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  for (const path of all) {
    const p = await ctx.newPage();
    const r = { path, dev, errors: [], failed: [], console: [] };
    p.on("pageerror", (e) => r.errors.push(e.message.slice(0, 200)));
    p.on("console", (m) => m.type() === "error" && r.console.push(m.text().slice(0, 200)));
    p.on("requestfailed", (q) => r.failed.push(q.url()));
    p.on("response", (s) => s.status() >= 400 && r.failed.push(s.status() + " " + s.url()));
    const t0 = Date.now();
    const res = await p.goto(SITE + path, { waitUntil: "load", timeout: 45000 }).catch((e) => ({ status: () => "ERR " + e.message.slice(0, 80) }));
    r.status = res.status();
    r.loadMs = Date.now() - t0;
    await p.waitForTimeout(1500);
    // scroll to trigger lazy images / fade-ins
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((z) => setTimeout(z, 120)); }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(800);
    Object.assign(r, await p.evaluate(() => {
      const meta = (n) => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.getAttribute("content") || "";
      const imgs = [...document.images];
      const small = [...document.querySelectorAll("a,button")].filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && (b.height < 32 || b.width < 32) && getComputedStyle(e).visibility !== "hidden";
      }).map((e) => (e.innerText || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30));
      const empty = [...document.querySelectorAll("a[href='#'],a:not([href]),a[href='']")].map((a) => a.innerText.trim().slice(0, 30));
      return {
        title: document.title,
        desc: meta("description"),
        ogImage: meta("og:image"),
        canonical: document.querySelector("link[rel=canonical]")?.href || "",
        lang: document.documentElement.lang,
        h1: [...document.querySelectorAll("h1")].map((h) => h.innerText.trim().slice(0, 80)),
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
        noAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
        heavyImgs: [],
        smallTaps: [...new Set(small)].slice(0, 15),
        emptyLinks: empty,
        links: [...document.querySelectorAll("a[href]")].map((a) => a.href),
        text: document.body.innerText.replace(/\s+/g, " ").slice(0, 2500),
        forms: [...document.forms].map((f) => ({ action: f.action, method: f.method, fields: [...f.elements].map((e) => e.name).filter(Boolean) })),
        lorem: /lorem|ipsum|TODO|placeholder|undefined|NaN|\[object/i.test(document.body.innerText),
      };
    }));
    r.links.forEach((l) => linkSet.add(l.split("#")[0]));
    delete r.links;
    const name = (path.replace(/\//g, "_") || "home").replace(/^_|_$/g, "") || "home";
    await p.screenshot({ path: `${OUT}/${dev}-${name}.jpg`, fullPage: true, type: "jpeg", quality: 55 });
    report.pages.push(r);
    console.log(dev, r.status, r.loadMs + "ms", path, r.errors.length ? "JSERR" : "", r.failed.length ? "FAILED:" + r.failed.length : "", r.overflowX > 0 ? "OVERFLOW " + r.overflowX : "");
    await p.close();
  }
  await ctx.close();
}

// Every distinct link: status check (internal + external).
for (const l of linkSet) {
  if (!/^https?:/.test(l)) { report.links[l] = "non-http"; continue; }
  try {
    const res = await fetch(l, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
    report.links[l] = res.status;
  } catch (e) {
    report.links[l] = "ERR " + e.message.slice(0, 60);
  }
}

// Flows: contact form, booking panel, WhatsApp, language switch, search bar.
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const flows = {};
await p.goto(SITE + "/contact/", { waitUntil: "load" });
flows.contactForm = await p.evaluate(() => [...document.forms].map((f) => ({ action: f.action, method: f.method, html: f.outerHTML.slice(0, 600) })));
await p.screenshot({ path: `${OUT}/flow-contact.jpg`, fullPage: true, type: "jpeg", quality: 55 });
const submit = p.locator("form button[type=submit], form input[type=submit]").first();
if (await submit.count()) {
  await submit.click().catch(() => {});
  await p.waitForTimeout(1500);
  flows.contactEmptySubmit = { url: p.url(), invalid: await p.evaluate(() => [...document.querySelectorAll(":invalid")].map((e) => e.name).filter(Boolean)) };
  await p.screenshot({ path: `${OUT}/flow-contact-empty-submit.jpg`, type: "jpeg", quality: 55 });
}
await p.goto(SITE + "/", { waitUntil: "load" });
flows.whatsapp = await p.evaluate(() => [...document.querySelectorAll("a")].filter((a) => /wa\.me|whatsapp/i.test(a.href)).map((a) => a.href).slice(0, 5));
flows.langLinks = await p.evaluate(() => [...document.querySelectorAll("a,button")].filter((a) => /^(ES|EN|Español)$/i.test(a.innerText.trim())).map((a) => a.outerHTML.slice(0, 200)));
await p.goto(SITE + "/es/", { waitUntil: "load" });
await p.screenshot({ path: `${OUT}/flow-es.jpg`, fullPage: true, type: "jpeg", quality: 55 });
// Search bar: pick dates + guests on the stays page
await p.goto(SITE + "/villas/", { waitUntil: "load" });
const d = (o) => { const x = new Date(); x.setDate(x.getDate() + o); return x.toISOString().slice(0, 10); };
await p.goto(`${SITE}/villas/?arrive=${d(40)}&depart=${d(44)}&guests=6`, { waitUntil: "load" });
await p.waitForTimeout(2500);
flows.searchSix = (await p.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 900);
await p.screenshot({ path: `${OUT}/flow-search-6-guests.jpg`, fullPage: true, type: "jpeg", quality: 55 });
// Booking panel on each villa: does a calendar + estimate appear?
flows.villas = {};
for (const path of all.filter((x) => x.startsWith("/villas/") && x.split("/").length > 3)) {
  await p.goto(`${SITE}${path}?arrive=${d(60)}&depart=${d(63)}&guests=2`, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const panel = (await p.locator("#inquire").innerText().catch(() => "NO PANEL")).replace(/\s+/g, " ");
  flows.villas[path] = { calendar: await p.getByLabel("Availability calendar").count(), panel: panel.slice(0, 400) };
}
await p.goto(SITE + "/villas/casa-jolu/", { waitUntil: "load" });
const gal = p.getByText(/View all \d+ photos/).first();
if (await gal.count()) {
  await gal.click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/flow-gallery-open.jpg`, type: "jpeg", quality: 55 });
}
report.flows = flows;
await b.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log("done", report.pages.length, "page loads,", linkSet.size, "links");
