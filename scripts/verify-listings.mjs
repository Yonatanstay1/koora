import fs from "node:fs";
import { JSDOM } from "jsdom";
const slugs = [
  ...fs.readFileSync("data/villas.ts", "utf8").matchAll(/slug: "([^"]+)"/g),
]
  .map((x) => x[1])
  .slice(0, 9);
const rows = await Promise.all(
  slugs.map(async (slug) => {
    const url = `https://koorarentals.com/listing/${slug}/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${slug}: ${res.status}`);
    const d = new JSDOM(await res.text()).window.document;
    const details = Object.fromEntries(
      [...d.querySelectorAll(".details-section li")].map((e) =>
        e.textContent
          .trim()
          .split(":")
          .map((x) => x.trim()),
      ),
    );
    const photos = [
      ...new Set(
        [...d.querySelectorAll("a.swipebox")]
          .map((e) => e.href)
          .filter((x) => x.includes("/uploads/")),
      ),
    ];
    const desc =
      d.querySelector(".listing-description") || d.querySelector(".block-body");
    const about = [...d.querySelectorAll("h2,h3")].find((x) =>
      x.textContent.includes("About this listing"),
    );
    return {
      slug,
      url,
      checkedAt: new Date().toISOString(),
      details,
      price: d
        .querySelector(".price-section")
        ?.textContent.trim()
        .replace(/\s+/g, " "),
      photos,
      description:
        about?.parentElement?.textContent.replace(/\s+/g, " ").trim() ||
        desc?.textContent.replace(/\s+/g, " ").trim(),
    };
  }),
);
fs.writeFileSync("data/source-listings.json", JSON.stringify(rows, null, 2));
console.log(
  rows.map(({ slug, details, price, photos, description }) => ({
    slug,
    details,
    price,
    photos: photos.length,
    description: description?.slice(0, 250),
  })),
);
