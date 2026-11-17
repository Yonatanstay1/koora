import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "./SearchBar";
import HeroVideo from "./HeroVideo";
import { SITE } from "@/data/site";
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink pt-40 text-white">
      <Image
        src="/images/editorial/hero.webp"
        alt="Open architecture and a pool surrounded by the landscape of Santa Teresa"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {SITE.heroVideo && <HeroVideo src={SITE.heroVideo} />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/25 to-black/80" />
      <div className="container-koora pb-10 lg:pb-14">
        <p className="eyebrow !text-white/90">
          Santa Teresa · Malpaís · Costa Rica
        </p>
        <h1 className="mt-7 max-w-5xl text-[clamp(3.5rem,8.5vw,8rem)] font-normal leading-[0.98] tracking-[-0.065em]">
          A sense of home.
          <br />A way of life.
        </h1>
        <div className="mt-9 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <p className="max-w-sm text-sm leading-7 text-white/90">
            Homes, hospitality and a deeper connection to Santa Teresa. Rooted
            here. Ready for you.
          </p>
          <nav
            aria-label="Discover Koora"
            className="flex flex-wrap gap-x-7 gap-y-3 text-[11px] uppercase tracking-[0.13em]"
          >
            <Link href="/villas">Stays ↗</Link>
            <Link href="/estate-management">Estate Management ↗</Link>
            <Link href="/development">Development ↗</Link>
          </nav>
        </div>
        <Suspense fallback={<div className="mt-10 h-36 bg-white" />}>
          <SearchBar className="mt-10 !rounded-none text-ink" variant="hero" />
        </Suspense>
      </div>
    </section>
  );
}
