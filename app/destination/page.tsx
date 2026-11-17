import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import {
  DestinationSection,
  JournalSection,
  MainCTA,
} from "@/components/BrandSections";
import { EXPERIENCES } from "@/data/site";
export const metadata = { title: "Destination — Santa Teresa & Malpaís" };
export default function Page() {
  return (
    <>
      <PageIntro
        label="Destination / Costa Rica"
        title="Life at your own pace."
        description="Two coastal rhythms, one local perspective. Discover Santa Teresa and Malpaís through the places, people and everyday moments that make them feel like home."
      />
      <DestinationSection />
      <section className="container-koora grid gap-12 pb-20 md:grid-cols-2">
        <div id="santa-teresa">
          <p className="eyebrow">Surf · Restaurants · Energy · Sunset</p>
          <h2 className="mt-5 text-4xl">Santa Teresa</h2>
          <p className="mt-5 text-sm leading-7 text-muted">
            Days shaped by the ocean and evenings spent together. Find your
            rhythm between your home, the beach and the places that become part
            of your stay.
          </p>
          <Link className="text-link mt-6" href="/villas?city=santa-teresa">
            Find a stay in Santa Teresa ↗
          </Link>
        </div>
        <div id="malpais">
          <p className="eyebrow">Nature · Privacy · Ocean · Slow Living</p>
          <h2 className="mt-5 text-4xl">Malpaís</h2>
          <p className="mt-5 text-sm leading-7 text-muted">
            Make room for quiet, nature and a slower day. Talk to the team about
            exploring Malpaís and finding a base that suits the way you want to
            spend your time.
          </p>
          <Link className="text-link mt-6" href="/contact">
            Ask about Malpaís ↗
          </Link>
        </div>
      </section>
      <section id="guide" className="bg-wash">
        <div className="container-koora py-20">
          <p className="eyebrow">The Koora guide</p>
          <h2 className="section-title mt-5">Follow your curiosity.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCES.map(([t, s, b]) => (
              <article
                id={t.toLowerCase().replaceAll(" ", "-")}
                key={t}
                className="border-t border-line pt-6"
              >
                <h3 className="text-2xl">{t}</h3>
                <p className="mt-4 text-sm">{s}</p>
                <p className="mt-3 text-sm leading-7 text-muted">{b}</p>
                <Link
                  className="text-link mt-4"
                  href={`/contact?interest=Other&message=${encodeURIComponent("I would like local recommendations for " + t.toLowerCase() + ".")}`}
                >
                  Ask our local team ↗
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <JournalSection />
      <MainCTA />
    </>
  );
}
