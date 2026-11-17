import { notFound } from "next/navigation";
import Link from "next/link";
import { JOURNAL } from "@/data/site";
import PageIntro from "@/components/PageIntro";
import MediaExperience from "@/components/MediaExperience";
export function generateStaticParams() {
  return JOURNAL.map((j) => ({ slug: j.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const j = JOURNAL.find((j) => j.slug === slug);
  return { title: j?.title || "Journal", description: j?.intro };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const j = JOURNAL.find((j) => j.slug === slug);
  if (!j) notFound();
  return (
    <article>
      <PageIntro
        label={`Koora Journal / ${j.category}`}
        title={j.title}
        description={j.intro}
        image={j.image}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        {j.paragraphs.map((p) => (
          <p key={p} className="mb-6 text-base leading-8 text-muted">
            {p}
          </p>
        ))}
        <MediaExperience media={j} name={j.title} />
        <div className="mt-10 flex flex-wrap gap-6">
          <Link className="text-link" href="/contact">
            Talk to Koora ↗
          </Link>
          <Link className="text-link" href="/journal">
            Back to the journal ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
