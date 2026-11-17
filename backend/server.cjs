const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { timingSafeEqual } = require("node:crypto");
const { createService, HttpError } = require("./inquiries.cjs");
const { openStore } = require("./sqlite.cjs");
const root = path.resolve(__dirname, "..");
const dataDir = process.env.KOORA_DATA_DIR || path.join(root, ".koora-data");
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const dbPath = path.join(dataDir, "inquiries.sqlite");
const store = openStore(dbPath);
fs.chmodSync(dbPath, 0o600);
const submit = createService(store);
const port = Number(process.env.PORT || 4300);
const host = process.env.HOST || "127.0.0.1";
const origin = process.env.KOORA_ORIGIN || `http://${host}:${port}`;
function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}
async function notify(id, data) {
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.KOORA_INQUIRY_TO ||
    !process.env.KOORA_EMAIL_FROM
  )
    return;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": id,
      },
      body: JSON.stringify({
        from: process.env.KOORA_EMAIL_FROM,
        to: [process.env.KOORA_INQUIRY_TO],
        reply_to: data.email,
        subject: `Koora inquiry ${id}`,
        text: Object.entries(data)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      }),
    });
    store.markNotified(id, r.ok ? "sent" : "failed");
    if (!r.ok) console.error("Inquiry notification failed", id, r.status);
  } catch {
    store.markNotified(id, "failed");
    console.error("Inquiry notification failed", id);
  }
}
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/inquiries" && req.method === "POST") {
    try {
      if (req.headers.origin !== origin)
        throw new HttpError(403, "This origin is not allowed.");
      if (!req.headers["content-type"]?.startsWith("application/json"))
        throw new HttpError(415, "JSON required.");
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > 16000) throw new HttpError(413, "Your message is too long.");
        chunks.push(c);
      }
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch {
        throw new HttpError(400, "Invalid inquiry.");
      }
      const result = await submit(body, {
        ip: req.socket.remoteAddress,
        key: req.headers["idempotency-key"] || "",
      });
      json(res, result.duplicate ? 200 : 201, {
        id: result.id,
        status: "received",
      });
      if (!result.duplicate) void notify(result.id, body);
    } catch (e) {
      if (!e.status) console.error("Inquiry storage failed");
      json(res, e.status || 503, {
        error: e.status
          ? e.message
          : "We could not save your inquiry. Please try WhatsApp or email.",
      });
    }
    return;
  }
  if (url.pathname === "/api/inquiries" && req.method === "GET") {
    const expected = process.env.KOORA_ADMIN_TOKEN;
    const supplied = (req.headers.authorization || "").replace(/^Bearer /, "");
    if (
      !expected ||
      expected.length < 32 ||
      Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
    ) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }
    json(res, 200, { inquiries: store.list() });
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    json(res, 404, { error: "Not found" });
    return;
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    json(res, 400, { error: "Invalid path" });
    return;
  }
  const out = path.join(root, "out");
  let file = path.resolve(out, "." + pathname);
  if (!file.startsWith(out + path.sep) && file !== out) {
    json(res, 403, { error: "Forbidden" });
    return;
  }
  if (file === out || pathname.endsWith("/"))
    file = path.join(file, "index.html");
  if (
    (!fs.existsSync(file) || fs.statSync(file).isDirectory()) &&
    !path.extname(file)
  )
    file += ".html";
  // Next's static export includes text payloads for client-side navigation.
  // Serving HTML for these requests would force a full-page navigation.
  if (req.headers.rsc === "1" && file.endsWith(".html")) {
    const payload = file.slice(0, -5) + ".txt";
    if (fs.existsSync(payload)) file = payload;
  }
  let status = 200;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    file = path.join(out, "404.html");
    status = 404;
  }
  if (!fs.existsSync(file)) {
    json(res, 503, { error: "Build the website with npm run build first." });
    return;
  }
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".xml": "application/xml",
  };
  res.writeHead(status, {
    "Content-Type":
      req.headers.rsc === "1" && file.endsWith(".txt")
        ? "text/x-component"
        : mime[path.extname(file)] || "application/octet-stream",
    "Cache-Control": file.includes("/_next/static/")
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(file).pipe(res);
});
server.listen(port, host, () =>
  console.log(
    `Koora preview: ${origin}. Inquiry storage ready. Email notification ${process.env.RESEND_API_KEY ? "configured" : "not configured; use the protected inquiry API to review submissions"}.`,
  ),
);
process.on("SIGTERM", () =>
  server.close(() => {
    store.close();
    process.exit(0);
  }),
);
