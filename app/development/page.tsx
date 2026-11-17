import Image from "next/image";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import MediaExperience from "@/components/MediaExperience";
import { MainCTA } from "@/components/BrandSections";
import { PROJECTS } from "@/data/site";
export const metadata = {
  title: "Development",
  description:
    "Development, construction, project management and interiors with Koora’s local team.",
};
export default function Page() {
  return (
    <>
      <PageIntro
        label="Development / Santa Teresa & Malpaís"
        title="From an idea to a place you can call home."
        description="Bring your vision to a team that understands the place around it. From planning and construction to the finishing details, start a conversation about what you want to create."
        image="/images/stays/casa-la-onda-ultra-suite-6.webp"
      />
      <p className="container-koora pt-3 text-[11px] text-muted">
        Architecture in the Koora stays collection.
      </p>
      <section className="container-koora py-20">
        <div className="grid gap-10 md:grid-cols-2">
          {[
            [
              "Development",
              "Define the ambition for your property, the priorities and the path ahead.",
            ],
            [
              "Construction",
              "Discuss the practical work of bringing a home into being, with local coordination.",
            ],
            [
              "Project Management",
              "Connect the people, stages and decisions involved in your project.",
            ],
            [
              "Interiors & Finishes",
              "Consider the materials and everyday details that turn a space into a home.",
            ],
          ].map(([t, b], i) => (
            <div key={t} className="border-t border-line pt-7">
              <p className="text-xs text-muted">0{i + 1}</p>
              <h2 className="mt-5 text-3xl">{t}</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted">{b}</p>
            </div>
          ))}
        </div>
        <Link
          href="/contact?interest=Development%20%2F%20Construction"
          className="btn-primary mt-12"
        >
          Talk about your project ↗
        </Link>
      </section>
      {PROJECTS.length > 0 && (
        <section className="container-koora py-16">
          <h2 className="section-title">Projects, in perspective.</h2>
          {PROJECTS.map((p) => (
            <article key={p.name} className="mt-12">
              <div className="relative aspect-video">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <p className="eyebrow mt-5">{p.stage}</p>
              <h3 className="mt-4 text-3xl">{p.name}</h3>
              <p className="mt-4 text-sm leading-7">{p.description}</p>
              <MediaExperience name={p.name} media={p} />
            </article>
          ))}
        </section>
      )}
      <MainCTA />
    </>
  );
}
