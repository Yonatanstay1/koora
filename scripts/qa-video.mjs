// Records the home page scrolling (GitHub Actions only).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const SITE = process.env.SITE || "https://koorarentals.com";
mkdirSync("shots/video", { recursive: true });
const b = await chromium.launch();
for (const [name, vp, mobile] of [["computer", { width: 1280, height: 800 }, false], ["phone", { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, recordVideo: { dir: "shots/video/" + name, size: vp } });
  const p = await ctx.newPage();
  await p.goto(SITE + "/?v=" + Date.now(), { waitUntil: "load" });
  await p.waitForTimeout(3500);
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 12) { await p.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y); await p.waitForTimeout(16); }
  if (!mobile) {
    await p.locator(".marquee").evaluate((e) => e.scrollIntoView({ block: "start", behavior: "instant" }));
    await p.waitForTimeout(1500);
    for (const s of ["surf", "local-food", "shopping"]) { await p.locator(`a[href="/destination/#${s}"]`).hover(); await p.waitForTimeout(700); }
  }
  await ctx.close();
}
await b.close();
