import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Questions & answers",
  description:
    "How to inquire about a Koora stay, confirm prices and prepare for Costa Rica.",
};
const faqs = [
  [
    "How do I book a stay?",
    "Choose a home and send an inquiry with your preferred dates and group size. Our team confirms availability, the total price and booking terms. Sending an inquiry does not reserve a home.",
  ],
  [
    "Are the dates on the website live availability?",
    "Availability is confirmed by our team. You can carry your preferred dates through the website and send them with your inquiry; the collection is filtered by group size and type of stay.",
  ],
  [
    "Is the displayed nightly rate the final price?",
    "The displayed price is the published listing rate in US dollars. Your quote may vary by season, length of stay, fees and the configuration of the home. We will confirm the full price before you commit.",
  ],
  [
    "What are the cancellation and payment terms?",
    "Ask the team for the terms that apply to your home and dates. Review the payment schedule, cancellation conditions and any deposit requirements before confirming.",
  ],
  [
    "Can I bring children or pets?",
    "Tell us the ages of any children and whether you’re travelling with a pet. Capacity, suitability and pet policies depend on the home. Our team will help confirm a suitable option.",
  ],
  [
    "What about check-in and housekeeping?",
    "Arrival times, checkout and housekeeping arrangements are confirmed for your chosen home. Tell us your travel plans or any special requests in your inquiry.",
  ],
  [
    "Will I need a car?",
    "Transport needs vary by location. Some hillside homes are easier to reach with a 4×4. Ask us about road access, transfers and getting around before making arrangements.",
  ],
  [
    "Can you help me choose a home?",
    "Yes. Tell us your group size, dates, budget and what you enjoy—beach days, quiet surroundings, a pool or gathering everyone together. You can select “Help me choose” in the inquiry form.",
  ],
];
export default function FaqPage() {
  return (
    <div className="container-koora pb-20 pt-32 lg:pt-44">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <p className="eyebrow">Before you pack</p>
          <h1 className="section-title mt-5">
            A few good
            <br />
            <em>questions.</em>
          </h1>
          <p className="mt-5 max-w-xs text-sm leading-7 text-muted">
            The things you might be wondering about. For everything else, we’re
            a message away.
          </p>
          <Link href="/contact" className="btn-ghost mt-7">
            Ask us anything
          </Link>
        </div>
        <div className="border-t border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group border-b border-line py-6">
              <summary className="flex cursor-pointer items-center justify-between gap-5 text-base">
                <span>{q}</span>
                <span
                  className="text-2xl font-light group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 pr-8 text-sm leading-7 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
