import fs from "node:fs";
import sharp from "sharp";
const sources = JSON.parse(
  fs.readFileSync("data/source-listings.json", "utf8"),
);
fs.mkdirSync("public/images/stays", { recursive: true });
fs.mkdirSync("public/images/editorial", { recursive: true });
for (const listing of sources) {
  await Promise.all(
    listing.photos.slice(0, 6).map(async (url, i) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(url);
      const raw = Buffer.from(await response.arrayBuffer());
      await sharp(raw)
        .rotate()
        .resize({ width: 1440, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(`public/images/stays/${listing.slug}-${i + 1}.webp`);
    }),
  );
  console.log(listing.slug);
}
await sharp("public/images/stays/casa-ficus-1.webp")
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile("public/images/editorial/hero.webp");
await sharp("public/images/stays/casa-loma-5.webp")
  .webp({ quality: 85 })
  .toFile("public/images/editorial/coast.webp");
