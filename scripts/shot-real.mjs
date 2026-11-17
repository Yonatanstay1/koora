// Screenshots of the REAL preview site + the Beds24 booking page it links to (run on GitHub).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("shots", { recursive: true });
const SITE = process.env.SITE || "https://yonatanstay1.github.io/koora";
const [A, D] = (process.env.STAY || "2026-12-07,2026-12-11").split(",");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(`${SITE}/villas/casa-ficus/?arrive=${A}&depart=${D}&guests=2`, { waitUntil: "load" });
const book = p.getByText("Book now");
await book.first().waitFor({ timeout: 20000 }).catch(() => {});
await p.locator("#inquire").scrollIntoViewIfNeeded();
await p.waitForTimeout(1500);
await p.locator("#inquire").screenshot({ path: "shots/real-1-villa.png" });
console.log("PANEL:", (await p.locator("#inquire").innerText()).replace(/\s+/g, " ").slice(0, 400));
const href = (await book.count()) ? await book.first().getAttribute("href") : null;
console.log("BOOK LINK:", href);
if (href) {
  await p.goto(href, { waitUntil: "load" });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: "shots/real-2-beds24.png", fullPage: true });
  console.log("BEDS24 TEXT:", (await p.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 900));
}
await b.close();
