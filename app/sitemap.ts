export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { JOURNAL } from "@/data/site";
import { VILLAS } from "@/data/villas";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://koorarentals.com";
  return [
    "",
    "/villas",
    "/estate-management",
    "/development",
    "/destination",
    "/journal",
    "/terms",
    "/es",
    ...JOURNAL.map((j) => "/journal/" + j.slug),
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    ...VILLAS.map((v) => "/villas/" + v.slug),
  ].map((path) => ({ url: base + path + "/" }));
}
