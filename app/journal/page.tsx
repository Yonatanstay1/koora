import PageIntro from "@/components/PageIntro";
import { JournalSection } from "@/components/BrandSections";
import { CONTACT } from "@/data/villas";
import { SITE } from "@/data/site";
export const metadata = { title: "Koora Journal" };
export default function Page() {
  return (
    <>
      <PageIntro
        label="Stories · Places · Homes · People"
        title="Koora Journal."
        description="A closer look at the homes, everyday details and life around us. Notes from Santa Teresa and Malpaís."
      />
      <div className="container-koora flex flex-wrap gap-4 border-y border-line py-6 text-[11px] uppercase tracking-widest">
        <span>Destination</span>
        <span>Homes</span>
        <span>People</span>
        <span>Development</span>
        <span>Behind Koora</span>
      </div>
      <JournalSection heading={false} />
      <section className="container-koora flex flex-wrap gap-8 pb-20">
        <a
          href={CONTACT.instagram}
          className="text-link"
          target="_blank"
          rel="noreferrer"
        >
          Follow Koora on Instagram ↗
        </a>
        {SITE.youtube && (
          <a
            href={SITE.youtube}
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Watch Koora on YouTube ↗
          </a>
        )}
      </section>
    </>
  );
}
