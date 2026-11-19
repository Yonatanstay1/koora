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
import Image from "next/image";
import { CONTACT, VILLAS } from "@/data/villas";
export default function HomePage() {
  const featured = [
    "pacific-surfshack",
    "casa-ficus",
    "santa-teresa-tree-house-1",
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
            <div key={villa.slug} data-reveal style={{ "--d": `${index * 120}ms` } as React.CSSProperties}>
              <VillaCard villa={villa} index={index} />
            </div>
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
        <div className="lg:sticky lg:top-28 lg:self-start">
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
          <div data-reveal="img" className="relative mt-10 hidden aspect-[5/4] overflow-hidden rounded-2xl sm:block">
            <Image
              src="/images/stays/casa-ficus-2.webp"
              alt="Inside a Koora home in Santa Teresa"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 font-display text-2xl leading-tight text-white sm:text-3xl">
              Talk to people who live here.
            </p>
          </div>
          <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
            <li>
              <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="group flex min-h-14 items-center justify-between gap-4 py-3">
                <span className="font-medium">WhatsApp</span>
                <span className="text-muted transition-colors group-hover:text-ink">The fastest way to reach us ↗</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="group flex min-h-14 items-center justify-between gap-4 py-3">
                <span className="font-medium">Email</span>
                <span className="break-all text-muted transition-colors group-hover:text-ink">{CONTACT.email}</span>
              </a>
            </li>
            <li className="flex min-h-14 items-center justify-between gap-4 py-3">
              <span className="font-medium">Based in</span>
              <span className="text-muted">Santa Teresa, Costa Rica</span>
            </li>
          </ul>
        </div>
        <div data-reveal>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
