import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/data/villas";
import Icon from "./Icon";
import {
  PILLARS,
  EXPERIENCES,
  JOURNAL,
  STATISTICS,
  STORIES,
  SALES,
  SITE,
} from "@/data/site";
export function Numbers() {
  return STATISTICS.length ? (
    <section aria-label="Koora in numbers" className="bg-ink text-white">
      <div className="container-koora grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {STATISTICS.map((s) => (
          <div key={s.label}>
            <p className="text-6xl tracking-tight">{s.value}</p>
            <p className="mt-4 text-xs text-white/70">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  ) : null;
}
export function ServiceSection({
  development = false,
}: {
  development?: boolean;
}) {
  return (
    <section className={development ? "bg-wash" : "bg-ink text-white"}>
      <div className="grid lg:grid-cols-2">
        <div
          className={`relative min-h-[360px] lg:min-h-[680px] ${development ? "lg:order-2" : ""}`}
        >
          <Image
            src={
              development
                ? "/images/stays/casa-la-onda-ultra-suite-6.webp"
                : "/images/stays/casa-loma-4.webp"
            }
            alt={
              development
                ? "Architecture and open living spaces at Casa La Onda"
                : "A Koora home and its outdoor living spaces"
            }
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="absolute bottom-6 left-6 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-widest text-white">
            {development
              ? "Architecture in the Koora collection"
              : "Care in every detail"}
          </span>
        </div>
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
          <p className={`eyebrow ${development ? "" : "!text-white/65"}`}>
            {development ? "03 / Development" : "02 / Estate Management"}
          </p>
          <h2 className="section-title mt-6">
            {development ? (
              <>
                From an idea.
                <br />
                To a place called home.
              </>
            ) : (
              <>
                Your home.
                <br />
                Our responsibility.
              </>
            )}
          </h2>
          <p
            className={`mt-7 max-w-md text-sm leading-7 ${development ? "text-muted" : "text-white/70"}`}
          >
            {development
              ? "Development, construction and project management, connected by a local perspective. Thoughtful spaces, from the first conversation to the finishing details."
              : "A home deserves attention long after the guests arrive. We bring hospitality, operations and property care together, with a team rooted in Santa Teresa."}
          </p>
          <p
            className={`mt-7 border-t pt-5 text-[11px] uppercase leading-7 tracking-wide ${development ? "border-line" : "border-white/20"}`}
          >
            {development
              ? "Development · Construction · Project Management · Interiors"
              : "Guest Care · Housekeeping · Maintenance · Revenue Management"}
          </p>
          <Link
            href={development ? "/development" : "/estate-management"}
            className={`mt-9 w-fit ${development ? "btn-primary" : "btn-light"}`}
          >
            {development ? "Explore Development" : "Discover Estate Management"}{" "}
            ↗
          </Link>
          {!development && (
            <Link
              href="/contact?interest=Estate%20Management"
              className="mt-6 w-fit border-b border-white/40 pb-2 text-xs"
            >
              List your property with Koora ↗
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
export function WhyKoora() {
  return (
    <section className="container-koora py-20 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Why Koora?</p>
          <h2 className="section-title mt-6">
            Local by nature.
            <br />
            Personal by choice.
          </h2>
          <div data-reveal="img" className="relative mt-10 aspect-[4/3] overflow-hidden lg:aspect-[4/5]">
            <Image
              src="/images/stays/ocean-view-jungle-villa-2.webp"
              alt="A Koora home among the trees near the ocean"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <span className="absolute bottom-5 left-5 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-widest text-white">
              Santa Teresa · Costa Rica
            </span>
          </div>
        </div>
        <ol className="lg:pt-28">
          {PILLARS.map(([title, body], i) => (
            <li
              key={title}
              data-reveal
              style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
              className="group grid grid-cols-[3.5rem_1fr] gap-5 border-t border-line py-9 last:border-b sm:grid-cols-[6rem_1fr] sm:gap-8"
            >
              <span className="font-display text-5xl leading-none tracking-tight text-ink/15 transition-colors duration-500 group-hover:text-ink sm:text-7xl">
                0{i + 1}
              </span>
              <div>
                <h3 className="text-2xl tracking-tight sm:text-3xl">{title}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
export function DestinationSection() {
  return (
    <section className="container-koora py-20 lg:py-28" id="locations">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">One coastline. Your own rhythm.</p>
          <h2 className="section-title mt-5">Pick your pace.</h2>
        </div>
        <Link className="text-link" href="/destination">
          Explore the destination ↗
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {[
          [
            "Santa Teresa",
            "Surf · Restaurants · Energy · Sunset",
            "/images/editorial/coast.webp",
            "santa-teresa",
          ],
          [
            "Malpaís",
            "Nature · Privacy · Ocean · Slow Living",
            "/images/editorial/hero.webp",
            "malpais",
          ],
        ].map(([title, sub, img, id]) => (
          <Link
            key={title}
            href={`/destination#${id}`}
            className="group relative flex aspect-[4/5] max-h-[620px] flex-col justify-end overflow-hidden bg-black p-8 text-white"
          >
            <Image
              src={img}
              alt={
                title === "Santa Teresa"
                  ? "Coastal view from a Koora villa"
                  : "Tropical garden and open-air living, a slower coastal rhythm"
              }
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative">
              <h3 className="text-4xl tracking-tight lg:text-5xl">{title} ↗</h3>
              <p className="mt-4 text-xs">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function Experiences() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Image
        src="/images/editorial/coast.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />
      <div aria-hidden="true" className="marquee overflow-hidden border-b border-white/15 py-7">
        <div className="marquee-track flex w-max gap-14 whitespace-nowrap font-display text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight">
          {[...EXPERIENCES, ...EXPERIENCES].map(([title], i) => (
            <span key={i} className={i % 2 ? "text-outline" : "text-white"}>
              {title}
            </span>
          ))}
        </div>
      </div>
      <div className="container-koora py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow !text-white/65">The Koora guide</p>
            <h2 className="section-title mt-5">More than a place to stay.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/75">
            Six ways to spend your days on this coast. Ask our team and we&rsquo;ll point you to the right places.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map(([title, sub, detail], i) => (
            <div key={title} data-reveal style={{ "--d": `${(i % 3) * 110}ms` } as React.CSSProperties}>
              <Link
                href={`/destination#${title.toLowerCase().replaceAll(" ", "-")}`}
                className="group flex h-full min-h-[15rem] flex-col justify-between rounded-2xl border border-white/15 bg-white/[0.07] p-7 backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:bg-white hover:text-ink"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs text-white/60 transition-colors group-hover:text-muted">0{i + 1}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition duration-500 group-hover:rotate-45 group-hover:border-ink/20">
                    <Icon name="arrow" className="h-4 w-4 -rotate-45" />
                  </span>
                </div>
                <div className="mt-10">
                  <h3 className="text-3xl tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-white/80 transition-colors group-hover:text-ink">{sub}</p>
                  {detail && (
                    <p className="mt-3 line-clamp-2 text-xs leading-6 text-white/55 transition-colors group-hover:text-muted">{detail}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
        <Link href="/destination#guide" className="text-link mt-10 !border-white/40">
          Explore the Koora guide ↗
        </Link>
      </div>
    </section>
  );
}
export function Stories() {
  return STORIES.length ? (
    <section className="container-koora py-20">
      <p className="eyebrow">Guest & Owner Stories</p>
      <h2 className="section-title mt-5">The people behind the places.</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {STORIES.map((s, i) => (
          <figure key={i} className="border-t border-line pt-8">
            <p className="eyebrow">{s.kind} story</p>
            {s.rating && (
              <p className="mt-4" aria-label={`${s.rating} out of 5`}>
                {"★".repeat(Math.round(s.rating))}
              </p>
            )}
            <blockquote className="mt-5 text-xl leading-relaxed">
              “{s.quote}”
            </blockquote>
            <figcaption className="mt-5 text-xs text-muted">
              {s.name} · {s.property} · {s.platform}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  ) : null;
}
export function JournalSection({ heading = true }: { heading?: boolean } = {}) {
  return (
    <section className="container-koora py-20 lg:py-28">
      {heading && <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Stories · Places · Homes · People</p>
          <h2 className="section-title mt-5">Koora Journal.</h2>
        </div>
        <Link href="/journal" className="text-link">
          Explore the journal ↗
        </Link>
      </div>}
      <div className={`${heading ? "mt-12 " : ""}grid gap-10 md:grid-cols-2`}>
        {JOURNAL.slice(0, 2).map((j) => (
          <Link key={j.slug} href={`/journal/${j.slug}`} className="group">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={j.image}
                alt={j.title}
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="eyebrow mt-6">
              {j.category}
              {j.videoUrl ? " · Film" : " · Notes"}
            </p>
            <h3 className="mt-3 text-3xl tracking-tight">{j.title} ↗</h3>
            <p className="mt-4 text-sm leading-7 text-muted">{j.intro}</p>
          </Link>
        ))}
      </div>
      {SITE.youtube && (
        <a href={SITE.youtube} className="text-link mt-10">
          Watch Koora on YouTube ↗
        </a>
      )}
    </section>
  );
}
export function SelectedProperties() {
  return SALES.length ? (
    <section className="container-koora py-16">
      <p className="eyebrow">Selected properties</p>
      <h2 className="mt-5 text-3xl">
        Occasional opportunities. Local connections.
      </h2>
      <p className="mt-5 text-sm text-muted">
        Occasionally, homes and land within our network become available.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {SALES.slice(0, 3).map((s) => (
          <Link href="/sales" key={s.name}>
            <div className="relative aspect-[4/3]">
              <Image
                src={s.image}
                alt={s.name}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
            <h3 className="mt-4 text-xl">{s.name}</h3>
            <p className="mt-2 text-xs">{s.location}</p>
          </Link>
        ))}
      </div>
      <Link href="/sales" className="text-link mt-8">
        View what’s available ↗
      </Link>
    </section>
  ) : null;
}
export function MainCTA() {
  return (
    <section className="bg-black text-white">
      <div className="container-koora py-20 lg:py-28">
        <p className="eyebrow !text-white/65">Let’s start a conversation</p>
        <h2 className="mt-7 max-w-4xl text-[clamp(3rem,6.5vw,6rem)] leading-[1.05] tracking-[-0.055em]">
          Thinking about
          <br />
          Santa Teresa?
        </h2>
        <div className="mt-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <p className="max-w-lg text-sm leading-7 text-white/70">
            Whether you’re planning a stay, looking for professional estate
            management or developing a property, talk to our local team.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
              className="btn-light"
            >
              WhatsApp us ↗
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center border border-white/40 px-7 py-3 text-sm"
            >
              Get in touch ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
