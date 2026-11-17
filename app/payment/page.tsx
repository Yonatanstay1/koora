import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { SITE } from "@/data/site";
export const metadata = { title: "Make a Payment" };
export default function Page() {
  return (
    <>
      <PageIntro
        label="Make a payment"
        title="Your next step, securely."
        description="Already arranged your stay or service with Koora? Use the payment instructions provided by our team for your booking or invoice."
      />
      <section className="container-koora pb-24">
        {SITE.paymentUrl ? (
          <a className="btn-primary" href={SITE.paymentUrl} rel="noreferrer">
            Continue to secure payment ↗
          </a>
        ) : (
          <>
            <p className="max-w-lg text-sm leading-7 text-muted">
              Online payments are not connected yet. Contact the team with your
              booking or invoice reference to request your payment instructions.
            </p>
            <Link
              className="btn-primary mt-8"
              href="/contact?interest=Other&message=Please%20help%20me%20with%20payment%20instructions%20for%20my%20booking%20or%20invoice."
            >
              Contact Koora about a payment ↗
            </Link>
          </>
        )}
      </section>
    </>
  );
}
