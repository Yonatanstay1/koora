const { chromium, webkit } = require("playwright");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { AxeBuilder } = require("@axe-core/playwright");
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "koora-browser-"));
  const port = process.env.QA_PORT || "4311";
  const origin = `http://127.0.0.1:${port}`;
  const token = randomUUID();
  const server = spawn(process.execPath, ["backend/server.cjs"], {
    env: {
      ...process.env,
      PORT: port,
      KOORA_ORIGIN: origin,
      KOORA_DATA_DIR: dir,
      KOORA_ADMIN_TOKEN: token,
      RESEND_API_KEY: "",
      KOORA_INQUIRY_TO: "",
      KOORA_EMAIL_FROM: "",
    },
    stdio: "pipe",
  });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("Server timeout")), 10000);
      server.stdout.on("data", (d) => {
        if (d.toString().includes("Koora preview")) {
          clearTimeout(t);
          resolve();
        }
      });
      server.on("error", reject);
    });
    for (const [headers, body, status] of [
      [{ Origin: "https://untrusted.example", "Content-Type": "application/json" }, "{}", 403],
      [{ Origin: origin, "Content-Type": "text/plain" }, "{}", 415],
      [{ Origin: origin, "Content-Type": "application/json" }, "{", 400],
      [{ Origin: origin, "Content-Type": "application/json" }, "x".repeat(16001), 413],
    ]) {
      const response = await fetch(origin + "/api/inquiries", { method: "POST", headers, body });
      assert.equal(response.status, status, `API rejects invalid request with ${status}`);
    }
    assert.equal((await fetch(origin + "/", { method: "POST" })).status, 405);
    console.log("PASS API origin, content-type, malformed-body, size and method guards");
    browser = process.env.BROWSER === "webkit" ? await webkit.launch() : await chromium.launch({
      executablePath:
        process.env.CHROME_PATH ||
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });
    const errors = [];
    const a11y = [];
    const slugs = require("../data/source-listings.json").map((x) => x.slug);
    const routes = [
      "/",
      "/villas",
      "/contact",
      "/about",
      "/faq",
      "/privacy",
      "/estate-management",
      "/development",
      "/destination",
      "/journal",
      "/journal/a-home-for-your-kind-of-stay",
      "/journal/before-you-arrive",
      "/sales",
      "/payment",
      "/terms",
      "/es",
      ...slugs.map((s) => "/villas/" + s),
    ];
    for (const width of [360, 768, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        isMobile: width < 768,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      for (const route of routes) {
        const response = await page.goto(origin + route, { waitUntil: "networkidle" });
        assert.equal(response.status(), 200, route);
        assert.equal(await page.locator("h1").count(), 1, route);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `${width} ${route} overflow`,
        );
        if (
          width === 1440 &&
          ["/", "/villas", "/contact", "/villas/casa-ficus"].includes(route)
        ) {
          const r = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          a11y.push(
            ...r.violations.map((v) => ({
              route,
              id: v.id,
              impact: v.impact,
              targets: v.nodes.map((n) => n.target),
            })),
          );
        }
      }
      console.log(`PASS ${routes.length} routes at ${width}px`);
      await context.close();
    }
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    await page.goto(origin + "/villas");
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => document.body.style.overflow !== "hidden");
    assert.equal(await page.locator("#mobile-menu").count(), 0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await page.waitForURL(/about/);
    assert.match(page.url(), /about/);
    assert.equal(
      await page.getByRole("navigation", { name: "Mobile navigation" }).count(),
      0,
    );
    await page.goto(origin + "/villas");
    await page.getByLabel("Arrival", { exact: true }).fill("2027-01-10");
    await page.getByLabel("Departure", { exact: true }).fill("2027-01-15");
    await page.getByLabel("Guests", { exact: true }).selectOption("4");
    await page.getByRole("button", { name: "Find stays" }).click();
    await page.waitForURL(/guests=4/);
    await page.getByRole("link", { name: "Pool days" }).click();
    await page.waitForURL(/kind=pool/);
    assert.match(page.url(), /arrive=2027-01-10/);
    await page.getByRole("link", { name: "Casa La Niña", exact: true }).click();
    await page.waitForURL(/casa-la-nina/);
    assert.match(page.url(), /guests=4/);
    await page.waitForFunction(
      () => document.querySelector('[name="arrive"]')?.value === "2027-01-10",
    );
    assert.equal(
      await page.locator("[name=arrive]").inputValue(),
      "2027-01-10",
    );
    await page
      .getByRole("button", { name: "Open photos of Casa La Niña" })
      .click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Next photo" }).click();
    assert.match(await page.getByRole("dialog").innerText(), /2 \/ 6/);
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.getByRole("button", { name: "Ask about this stay" }).click();
    await page.waitForURL(/contact\?/);
    await page.waitForFunction(
      () => document.querySelector('[name="villa"]')?.value === "casa-la-nina",
    );
    assert.equal(
      await page.locator("[name=villa]").inputValue(),
      "casa-la-nina",
    );
    assert.equal(await page.locator("[name=guests]").inputValue(), "4");
    await page.getByLabel("Your name", { exact: true }).fill("Browser Test");
    await page
      .getByLabel("Email address", { exact: true })
      .fill("browser@example.test");
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Send inquiry", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Your inquiry is saved." })
      .waitFor();
    assert.match(await page.getByRole("status").innerText(), /K-[A-F0-9-]+/);
    let result = await fetch(origin + "/api/inquiries", {
      headers: { Authorization: "Bearer " + token },
    });
    assert.equal(result.status, 200);
    const saved = (await result.json()).inquiries;
    assert.equal(saved.length, 1);
    assert.equal(saved[0].data.villa, "casa-la-nina");
    assert.equal(saved[0].data.arrive, "2027-01-10");
    assert.equal((await fetch(origin + "/api/inquiries")).status, 401);
    await page.goto(origin + "/contact?interest=Estate%20Management");
    await page.waitForFunction(
      () =>
        document.querySelector('[name="interest"]')?.value ===
        "Estate Management",
    );
    assert.equal(await page.locator('[name="arrive"]').count(), 0);
    await page.getByLabel("Your name", { exact: true }).fill("Owner Test");
    await page
      .getByLabel("Email address", { exact: true })
      .fill("owner@example.test");
    await page.getByLabel("Phone / WhatsApp").fill("+506 1234 5678");
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Send inquiry", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Your inquiry is saved." })
      .waitFor();
    result = await fetch(origin + "/api/inquiries", {
      headers: { Authorization: "Bearer " + token },
    });
    const owner = (await result.json()).inquiries.find(
      (i) => i.data.email === "owner@example.test",
    );
    assert.equal(owner.data.interest, "Estate Management");
    assert.equal(owner.data.phone, "+506 1234 5678");
    assert.equal(owner.data.villa, "");
    await page.goto(origin + "/contact");
    await page.getByLabel("Your name", { exact: true }).fill("Failure Test");
    await page
      .getByLabel("Email address", { exact: true })
      .fill("failure@example.test");
    await page.getByRole("checkbox").check();
    await page.route("**/api/inquiries", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Service unavailable. Please use WhatsApp.",
        }),
      }),
    );
    await page
      .getByRole("button", { name: "Send inquiry", exact: true })
      .click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Service unavailable" })
      .waitFor();
    assert.equal(
      await page.getByLabel("Your name", { exact: true }).inputValue(),
      "Failure Test",
    );
    assert.equal(
      await page
        .getByRole("heading", { name: "Your inquiry is saved." })
        .count(),
      0,
    );
    assert.match(
      await page
        .getByRole("link", { name: /Prefer WhatsApp/ })
        .getAttribute("href"),
      /Failure%20Test/,
    );
    console.log(
      "PASS mobile navigation, date preservation, gallery, inquiry persistence, staff auth, failed-delivery fallback",
    );
    console.log("Accessibility findings:", JSON.stringify(a11y));
    assert.equal(a11y.length, 0, "Accessibility findings need review");
    assert.deepEqual(errors, []);
    console.log("PASS browser review");
  } finally {
    if (browser) await browser.close();
    if (server.exitCode === null && server.signalCode === null) {
      const exited = new Promise((r) => server.once("exit", r));
      server.kill("SIGTERM");
      await exited;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
