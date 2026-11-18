// Date picker + link-preview check on the live site (GitHub Actions only).
import { chromium, webkit } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const SITE = process.env.SITE || "https://koorarentals.com";
const OUT = "shots/picker";
mkdirSync(OUT, { recursive: true });
const report = { errors: [], steps: {} };
const shot = (p, n) => p.screenshot({ path: `${OUT}/${n}.jpg`, type: "jpeg", quality: 70 });
for (const [engine, launcher] of [["chromium", chromium], ["webkit", webkit]]) {
  const b = await launcher.launch();
  for (const [dev, vp, mobile] of [["desk", { width: 1440, height: 900 }, false], ["phone", { width: 390, height: 844 }, true]]) {
    if (engine === "webkit" && mobile) continue;
    const tag = `${engine}-${dev}`;
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile && engine === "chromium", hasTouch: mobile });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => report.errors.push(tag + " " + e.message));
    await p.goto(SITE + "/", { waitUntil: "load" });
    const checkIn = p.getByRole("button", { name: /Check-in/ }).first();
    await checkIn.scrollIntoViewIfNeeded();
    await shot(p, `${tag}-1-bar`);
    await checkIn.click();
    await p.waitForTimeout(700);
    await shot(p, `${tag}-2-open`);
    const dlg = p.getByRole("dialog", { name: "Choose your dates" });
    const days = dlg.locator("button[aria-label*='202']:not([disabled])");
    await days.nth(20).click();
    await p.waitForTimeout(300);
    if (!mobile) await days.nth(24).hover();
    await shot(p, `${tag}-3-checkin`);
    await days.nth(24).click();
    await p.waitForTimeout(300);
    await shot(p, `${tag}-4-range`);
    report.steps[tag] = { prompt: (await dlg.innerText()).replace(/\s+/g, " ").slice(0, 160) };
    await dlg.getByRole("button", { name: "Done" }).click();
    await p.waitForTimeout(400);
    await shot(p, `${tag}-5-done`);
    report.steps[tag].bar = (await p.locator("form").first().innerText()).replace(/\s+/g, " ").slice(0, 160);
    await p.getByRole("button", { name: /Find stays/ }).click();
    await p.waitForURL(/arrive=/, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(2500);
    report.steps[tag].url = p.url();
    await shot(p, `${tag}-6-results`);
    // Reopen from the results page: picker shows the chosen stay.
    await p.getByRole("button", { name: /Check-out/ }).first().click();
    await p.waitForTimeout(600);
    await shot(p, `${tag}-7-reopen`);
    await p.keyboard.press("Escape");
    report.steps[tag].closedOnEsc = (await dlg.count()) === 0;
    await ctx.close();
  }
  await b.close();
}
// Link preview tags (what WhatsApp reads).
for (const path of ["/", "/villas/casa-ficus/"]) {
  const html = await (await fetch(SITE + path)).text();
  report[path] = [...html.matchAll(/<meta (?:property|name)="(og:[^"]+|twitter:card)" content="([^"]*)"/g)].map((m) => m[1] + "=" + m[2]);
  const img = report[path].find((x) => x.startsWith("og:image="))?.slice(9);
  if (img) { const r = await fetch(img); report[path].push(`IMAGE ${r.status} ${r.headers.get("content-type")} ${r.headers.get("content-length")}`); }
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
