import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaExperience from "@/components/MediaExperience";
import BookingPanel from "@/components/BookingPanel";
import VillaCard from "@/components/VillaCard";
import VillaGallery from "@/components/VillaGallery";
import Icon from "@/components/Icon";
import { getVilla, VILLAS } from "@/data/villas";
export function generateStaticParams() {
  return VILLAS.map((v) => ({ slug: v.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = getVilla(slug);
  return v
    ? {
        title: v.name,
        description: `${v.name} in ${v.cityLabel}, Costa Rica. ${v.beds} bedrooms for up to ${v.sleeps} guests. Explore the home and ask Koora about your stay.`,
        alternates: { canonical: `/villas/${v.slug}/` },
        openGraph: {
          title: `${v.name} · ${v.cityLabel}`,
          description: `${v.beds} bedrooms · up to ${v.sleeps} guests · Costa Rica. Choose your dates and send a booking request to Koora.`,
          url: `/villas/${v.slug}/`,
          siteName: "Koora Rentals",
          type: "website",
          images: [{ url: `/og/${v.slug}.jpg`, width: 1200, height: 630, alt: v.name }],
        },
      }
    : { title: "Stay not found" };
}
export default async function VillaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const villa = getVilla(slug);
  if (!villa) notFound();
  const related = VILLAS.filter((v) => v.slug !== villa.slug)
    .sort(
      (a, b) =>
        Math.abs(a.sleeps - villa.sleeps) - Math.abs(b.sleeps - villa.sleeps),
    )
    .slice(0, 3);
  return (
    <article className="pb-28 pt-28 lg:pb-0 lg:pt-36">
      <div className="container-koora">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-3 text-xs text-muted"
        >
          <Link href="/villas" className="underline underline-offset-4">
            Our stays
          </Link>
          <span>/</span>
          <span>{villa.cityLabel}</span>
        </nav>
        <header className="mb-8 mt-7">
          <p className="eyebrow">{villa.cityLabel} · Costa Rica</p>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.7rem,5vw,5rem)] leading-[1.02] tracking-tight">
            {villa.name}
          </h1>
          <p className="mt-4 text-sm text-muted">{villa.tagline}</p>
        </header>
        <VillaGallery images={villa.images} name={villa.name} />
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div>
            <div className="grid grid-cols-3 border-y border-line py-6">
              {[
                [String(villa.sleeps), "Guests"],
                [String(villa.beds), "Bedrooms"],
                [String(villa.baths), "Bathrooms"],
              ].map(([n, label]) => (
                <div key={label}>
                  <p className="font-display text-4xl">{n}</p>
                  <p className="mt-1 text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
            <section className="mt-10">
              <p className="eyebrow">A place to settle in</p>
              <h2 className="mt-3 font-display text-4xl">
                Life, a little slower.
              </h2>
              <p className="mt-5 text-sm leading-8 text-muted">
                {villa.description}
              </p>
            </section>
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="font-display text-3xl">The little details</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {villa.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-sm">
                    <Icon name="check" className="h-4 w-4 text-clay" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="font-display text-3xl">
                Make yourself comfortable
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-4 text-sm text-muted">
                {villa.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-3">
                    <span className="h-1 w-1 rounded-full bg-clay" />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-10 rounded-xl bg-wash p-6">
              <h2 className="font-display text-3xl">Before you arrive</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Our team will confirm the total price, arrival arrangements,
                minimum stay and cancellation terms for your dates before you
                commit. Tell us about pets, children or any access requirements
                in your inquiry.
              </p>
            </section>
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="font-display text-3xl">Around here</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {villa.cityLabel}, on Costa Rica’s Nicoya Peninsula. Ask us
                about the route to the house, road conditions and the best way
                to arrive.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(villa.cityLabel + ", Costa Rica")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link mt-4"
              >
                Explore the area <Icon name="arrow" className="h-4 w-4" />
              </a>
              <p className="mt-3 text-[11px] text-muted">
                Exact arrival directions are provided by the team.
              </p>
            </section>
          </div>
          <div>
            <BookingPanel villa={villa} />
            {villa.bookingUrl && (
              <a
                href={villa.bookingUrl}
                className="btn-primary mt-6 w-full"
                target="_blank"
                rel="noreferrer"
              >
                Check availability & book ↗
              </a>
            )}
          </div>
        </div>
        <MediaExperience media={villa} name={villa.name} />
        <section className="py-20 lg:py-28">
          <p className="eyebrow">A few more places to call yours</p>
          <h2 className="section-title mt-4">
            Keep <em>exploring.</em>
          </h2>
          <div className="mt-9 grid gap-x-7 gap-y-12 md:grid-cols-3">
            {related.map((v) => (
              <VillaCard key={v.slug} villa={v} />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
