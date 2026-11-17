import Link from "next/link";
import PageIntro from "@/components/PageIntro";
export const metadata = { title: "Booking & Service Terms" };
export default function Page() {
  return (
    <>
      <PageIntro
        label="Booking & service information"
        title="Before you confirm."
        description="The details of your stay or service are agreed with the Koora team before confirmation."
      />
      <section className="container-koora max-w-4xl pb-24">
        <h2 className="text-2xl">Stays and inquiries</h2>
        <p className="mt-5 text-sm leading-8 text-muted">
          Submitting an inquiry does not reserve a property. Listed prices are
          reference rates; availability, the final quote, payment schedule and
          cancellation conditions are confirmed separately for your dates and
          chosen home.
        </p>
        <h2 className="mt-10 text-2xl">Property services</h2>
        <p className="mt-5 text-sm leading-8 text-muted">
          Estate management and development services are subject to an agreed
          scope and individual service terms. Ask the team for the terms that
          apply to your project or property.
        </p>
        <Link className="text-link mt-8" href="/contact">
          Request your booking or service terms ↗
        </Link>
      </section>
    </>
  );
}
