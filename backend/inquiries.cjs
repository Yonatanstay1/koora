const { randomUUID, createHash } = require("node:crypto");
const sources = require("../data/source-listings.json");
const villas = new Map(
  sources.map((v) => [
    v.slug,
    { name: v.slug.replaceAll("-", " "), guests: Number(v.details.Guests) },
  ]),
);
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const trim = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
function validate(body, now = new Date()) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new HttpError(400, "Please check your inquiry.");
  if (body.website) throw new HttpError(400, "Unable to accept this inquiry.");
  const data = {
    name: trim(body.name, 100),
    phone: trim(body.phone, 40),
    interest: trim(body.interest, 60) || "Booking a Villa",
    email: trim(body.email, 254),
    villa: trim(body.villa, 100),
    arrive: trim(body.arrive, 10),
    depart: trim(body.depart, 10),
    guests: Number(body.guests),
    message: trim(body.message, 3000),
  };
  if (
    ![
      "Booking a Villa",
      "Estate Management",
      "Development / Construction",
      "Selected Property",
      "Other",
    ].includes(data.interest)
  )
    throw new HttpError(400, "Please select an inquiry type.");
  if (data.interest !== "Booking a Villa") {
    data.guests = 1;
    data.villa = "";
    data.arrive = "";
    data.depart = "";
  }
  if (data.name.length < 2) throw new HttpError(400, "Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    throw new HttpError(400, "Please enter a valid email address.");
  if (!Number.isInteger(data.guests) || data.guests < 1 || data.guests > 30)
    throw new HttpError(400, "Please enter a group size between 1 and 30.");
  if (data.villa && !villas.has(data.villa))
    throw new HttpError(400, "Please choose a home from the collection.");
  if (data.villa && data.guests > villas.get(data.villa).guests)
    throw new HttpError(
      400,
      "Your group exceeds this home’s capacity. Choose another home or ask us to recommend one.",
    );
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const valid = (s) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !Number.isNaN(Date.parse(s)) &&
    new Date(s).toISOString().slice(0, 10) === s;
  if (data.arrive || data.depart) {
    if (
      !valid(data.arrive) ||
      !valid(data.depart) ||
      data.arrive < today ||
      data.depart <= data.arrive
    )
      throw new HttpError(
        400,
        "Please choose a future arrival and a later departure.",
      );
  }
  if (body.consent !== true)
    throw new HttpError(
      400,
      "Please agree to be contacted about your inquiry.",
    );
  return { ...data, consent: true, consentVersion: "2026-09-25" };
}
function createService(store) {
  return async function submit(
    body,
    { ip = "unknown", key = "", now = new Date() } = {},
  ) {
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(key))
      throw new HttpError(400, "Please refresh the page and try again.");
    const data = validate(body, now);
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
    const id = "K-" + randomUUID().toUpperCase();
    return store.accept({
      id,
      key,
      fingerprint,
      data,
      createdAt: now.toISOString(),
      rateKey: createHash("sha256")
        .update(ip + now.toISOString().slice(0, 13))
        .digest("hex"),
    });
  };
}
module.exports = { HttpError, validate, createService };
