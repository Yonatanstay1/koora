const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createService, validate } = require("../backend/inquiries.cjs");
const { openStore } = require("../backend/sqlite.cjs");
const { randomUUID } = require("node:crypto");
const valid = () => ({
  name: "Test Guest",
  email: "guest@example.test",
  villa: "casa-ficus",
  arrive: "2027-01-10",
  depart: "2027-01-15",
  guests: 4,
  message: "An inquiry",
  consent: true,
});
const now = new Date("2026-09-25T12:00:00Z");
test("validates dates, capacity, email, consent and unknown listings", () => {
  for (const change of [
    { arrive: "2020-01-01" },
    { depart: "2027-01-09" },
    { arrive: "2027-02-30" },
    { guests: 7 },
    { guests: 1.5 },
    { email: "bad" },
    { consent: false },
    { villa: "unknown" },
    { website: "spam.example" },
  ])
    assert.throws(() => validate({ ...valid(), ...change }, now));
  assert.equal(
    validate({ ...valid(), arrive: "", depart: "" }, now).arrive,
    "",
  );
});
test("saves inquiries durably, retries once and rejects changed duplicate", async () => {
  const s = openStore(":memory:");
  try {
    const submit = createService(s);
    const key = randomUUID();
    const a = await submit(valid(), { key, ip: "one", now });
    const b = await submit(valid(), { key, ip: "one", now });
    assert.equal(a.id, b.id);
    assert.equal(b.duplicate, true);
    assert.equal(s.list().length, 1);
    assert.equal(s.list()[0].data.email, "guest@example.test");
    await assert.rejects(
      submit({ ...valid(), guests: 3 }, { key, ip: "one", now }),
      (e) => e.status === 409,
    );
  } finally {
    s.close();
  }
});
test("limits new inquiries, permits a retry, resets in next hour", async () => {
  const s = openStore(":memory:");
  try {
    const submit = createService(s);
    const keys = Array.from({ length: 5 }, () => randomUUID());
    for (const key of keys) await submit(valid(), { key, ip: "one", now });
    await assert.rejects(
      submit(valid(), { key: randomUUID(), ip: "one", now }),
      (e) => e.status === 429,
    );
    assert.equal(
      (await submit(valid(), { key: keys[0], ip: "one", now })).duplicate,
      true,
    );
    await submit(valid(), {
      key: randomUUID(),
      ip: "one",
      now: new Date("2026-09-25T13:00:00Z"),
    });
    assert.equal(s.list().length, 6);
  } finally {
    s.close();
  }
});
test("storage failures are not converted into successful receipts", async () => {
  const submit = createService({
    accept() {
      throw new Error("disk full");
    },
  });
  await assert.rejects(
    submit(valid(), { key: randomUUID(), now }),
    /disk full/,
  );
});
test("persisted inquiries survive closing and reopening the database", async () => {
  const fs = require("node:fs"),
    os = require("node:os"),
    path = require("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "koora-persist-"));
  const dbPath = path.join(dir, "test.sqlite");
  let store = openStore(dbPath);
  try {
    const result = await createService(store)(valid(), {
      key: randomUUID(),
      now,
    });
    store.close();
    store = openStore(dbPath);
    assert.equal(store.list()[0].id, result.id);
    assert.equal(store.list()[0].data.guests, 4);
  } finally {
    store.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("owner and development inquiries preserve routing and phone without requiring stay details", async () => {
  const store = openStore(":memory:");
  try {
    for (const interest of [
      "Estate Management",
      "Development / Construction",
    ]) {
      await createService(store)(
        {
          name: "Owner Test",
          email: "owner@example.test",
          phone: "+506 1234 5678",
          interest,
          consent: true,
        },
        { key: randomUUID(), now },
      );
    }
    assert.equal(store.list().length, 2);
    for (const row of store.list()) {
      assert.equal(row.data.phone, "+506 1234 5678");
      assert.equal(row.data.arrive, "");
      assert.equal(row.data.villa, "");
      assert.ok(
        ["Estate Management", "Development / Construction"].includes(
          row.data.interest,
        ),
      );
    }
    assert.throws(() =>
      validate({ ...valid(), interest: "Unknown service" }, now),
    );
  } finally {
    store.close();
  }
});
