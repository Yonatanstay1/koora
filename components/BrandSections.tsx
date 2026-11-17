import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/data/villas";
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
    <section className="container-koora py-20 lg:py-28">
      <div className="grid gap-8 lg:grid-cols-2">
        <p className="eyebrow">Why Koora?</p>
        <h2 className="section-title">
          Local by nature.
          <br />
          Personal by choice.
        </h2>
      </div>
      <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map(([title, body], i) => (
          <div className="border-t border-line pt-6" key={title}>
            <span className="text-xs text-muted">0{i + 1}</span>
            <h3 className="mt-6 text-xl">{title}</h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted">{body}</p>
          </div>
        ))}
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
    <section className="bg-wash">
      <div className="container-koora py-20">
        <p className="eyebrow">The Koora guide</p>
        <h2 className="section-title mt-5">More than a place to stay.</h2>
        <div className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map(([title, sub], i) => (
            <Link
              key={title}
              href={`/destination#${title.toLowerCase().replaceAll(" ", "-")}`}
              className="group border-t border-line py-7"
            >
              <p className="text-xs text-muted">0{i + 1}</p>
              <h3 className="mt-5 flex justify-between text-2xl">
                {title}
                <span className="transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </h3>
              <p className="mt-3 text-sm text-muted">{sub}</p>
            </Link>
          ))}
        </div>
        <Link href="/destination#guide" className="text-link mt-8">
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
export function JournalSection() {
  return (
    <section className="container-koora py-20 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Stories · Places · Homes · People</p>
          <h2 className="section-title mt-5">Koora Journal.</h2>
        </div>
        <Link href="/journal" className="text-link">
          Explore the journal ↗
        </Link>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
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
