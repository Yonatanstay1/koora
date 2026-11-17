import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { SALES } from "@/data/site";
export const metadata = { title: "Selected Properties" };
export default function Page() {
  return (
    <>
      <PageIntro
        label="Selected properties"
        title="Local connections. Occasional opportunities."
        description="Occasionally, homes and land within our network become available. This is a small selection of opportunities connected to Koora, not a brokerage service."
      />
      <section className="container-koora pb-24">
        {SALES.length ? (
          SALES.map((s) => (
            <article className="mb-10 border-t border-line pt-6" key={s.name}>
              <h2 className="text-3xl">{s.name}</h2>
              <p className="mt-4 text-xs">{s.location}</p>
              <p className="mt-4 text-sm leading-7">{s.description}</p>
            </article>
          ))
        ) : (
          <p className="max-w-xl border-t border-line pt-8 text-sm leading-7 text-muted">
            There are no selected properties published at the moment. For a
            specific inquiry, speak with our local team.
          </p>
        )}
        <Link
          className="text-link mt-8"
          href="/contact?interest=Selected%20Property"
        >
          Get in touch ↗
        </Link>
      </section>
    </>
  );
}
