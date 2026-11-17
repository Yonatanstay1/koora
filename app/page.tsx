import Link from "next/link";
import Hero from "@/components/Hero";
import VillaCard from "@/components/VillaCard";
import ContactForm from "@/components/ContactForm";
import {
  Numbers,
  ServiceSection,
  WhyKoora,
  DestinationSection,
  Experiences,
  Stories,
  JournalSection,
  SelectedProperties,
  MainCTA,
} from "@/components/BrandSections";
import { VILLAS } from "@/data/villas";
export default function HomePage() {
  const featured = [
    "casa-loma",
    "casa-la-nina",
    "casa-la-onda-ultra-suite",
  ].map((slug) => VILLAS.find((v) => v.slug === slug)!);
  return (
    <>
      <Hero />
      <Numbers />
      <section id="collection" className="container-koora py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">01 / Stays</p>
            <h2 className="section-title mt-5">
              Somewhere that
              <br />
              feels like you.
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-7 text-muted">
              A considered collection of homes. Space to settle in, come
              together and make Santa Teresa your own.
            </p>
            <Link href="/villas" className="text-link mt-5">
              Explore all villas ↗
            </Link>
          </div>
        </div>
        <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-3">
          {featured.map((villa, index) => (
            <VillaCard key={villa.slug} villa={villa} index={index} />
          ))}
        </div>
      </section>
      <ServiceSection />
      <WhyKoora />
      <ServiceSection development />
      <DestinationSection />
      <Experiences />
      <Stories />
      <JournalSection />
      <SelectedProperties />
      <MainCTA />
      <section
        id="contact"
        className="container-koora grid gap-12 py-20 lg:grid-cols-2 lg:py-28"
      >
        <div>
          <p className="eyebrow">Stay. Care. Create.</p>
          <h2 className="section-title mt-5">
            What brings
            <br />
            you here?
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
            A few details are all we need to start. Tell us about your plans and
            we’ll connect you with our local team.
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
