import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { WhyKoora, MainCTA } from "@/components/BrandSections";
export const metadata = {
  title: "Estate Management",
  description:
    "Local property care, hospitality and vacation rental management in Santa Teresa and Malpaís.",
};
const services = [
  [
    "Vacation Rental Management",
    "A coordinated approach to running your home as a vacation rental.",
  ],
  [
    "Guest Communication",
    "A personal point of contact before arrival and throughout each stay.",
  ],
  ["Concierge", "Help guests shape a stay around their plans and preferences."],
  [
    "Housekeeping",
    "Coordinate cleaning, preparation and the details that welcome guests.",
  ],
  [
    "Maintenance",
    "Arrange the everyday work that helps keep your property cared for.",
  ],
  [
    "Property Supervision",
    "A local presence to coordinate attention when your home needs it.",
  ],
  [
    "Booking Management",
    "Bring reservation details and arrival arrangements together.",
  ],
  [
    "Revenue Management",
    "Plan pricing and rental operations around the property and its goals.",
  ],
  [
    "Complete Property Care",
    "One team connecting hospitality, operations and ongoing home care.",
  ],
];
export default function Page() {
  return (
    <>
      <PageIntro
        label="For homeowners / Estate Management"
        title="Your home. Our responsibility."
        description="A home is personal. Its care should be too. Koora brings the day-to-day work of hospitality and property operations together through one local team."
        image="/images/stays/casa-loma-4.webp"
      />
      <section className="container-koora py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="section-title">
            Every detail.
            <br />
            One local team.
          </h2>
          <Link
            href="/contact?interest=Estate%20Management"
            className="btn-primary"
          >
            List your property with Koora ↗
          </Link>
        </div>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([t, b], i) => (
            <div className="border-t border-line pt-6" key={t}>
              <p className="text-xs text-muted">0{i + 1}</p>
              <h3 className="mt-5 text-xl">{t}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-wash">
        <div className="container-koora grid gap-10 py-16 md:grid-cols-3">
          {[
            [
              "01 / A conversation",
              "Tell us about your home, your priorities and what you need from a management team.",
            ],
            [
              "02 / A closer look",
              "We discuss the property, its operations and the areas where local support will make a difference.",
            ],
            [
              "03 / A plan for your home",
              "Together, we agree the scope of care, communication and services before getting started.",
            ],
          ].map(([t, b]) => (
            <div key={t}>
              <h2 className="text-xl">{t}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </section>
      <WhyKoora />
      <MainCTA />
    </>
  );
}
