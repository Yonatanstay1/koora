import Link from "next/link";
import VillaCard from "@/components/VillaCard";
import { VILLAS } from "@/data/villas";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  const picks = ["pacific-surfshack", "ocean-view-jungle-villa", "casa-ficus"]
    .map((s) => VILLAS.find((v) => v.slug === s))
    .filter((v) => !!v);
  return (
    <>
      <section className="container-koora pb-12 pt-32 lg:pt-40">
        <p className="eyebrow">Page not found</p>
        <h1 className="section-title mt-5">This page has moved on.</h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
          The link may be old or mistyped. Our homes in Santa Teresa and Malpaís are all still here.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/villas" className="btn-primary">
            See all stays
          </Link>
          <Link href="/contact" className="btn-ghost">
            Talk to us
          </Link>
        </div>
      </section>
      <section className="container-koora grid gap-10 pb-24 md:grid-cols-3">
        {picks.map((v) => (
          <VillaCard key={v.slug} villa={v} />
        ))}
      </section>
    </>
  );
}
