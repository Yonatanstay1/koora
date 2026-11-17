import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import { CONTACT } from "@/data/villas";
export const metadata: Metadata = {
  title: "Contact Koora",
  description:
    "Speak with Koora about stays, estate management and development in Santa Teresa and Malpaís.",
};
export default function ContactPage() {
  return (
    <div className="container-koora pb-20 pt-32 lg:pb-28 lg:pt-44">
      <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32">
          <p className="eyebrow">Stays · Estate Management · Development</p>
          <h1 className="section-title mt-5">
            What brings
            <br />
            you here?
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
            A stay, a home to care for, or a project to bring to life. Tell us
            what you have in mind and connect with our local team.
          </p>
          <div className="mt-9 space-y-6 border-t border-line pt-8">
            <a
              href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-wash">
                <Icon name="chat" className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm">Talk to us on WhatsApp ↗</span>
                <span className="mt-1 block text-xs text-muted">
                  {CONTACT.phone1}
                </span>
              </span>
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="block text-sm underline underline-offset-4"
            >
              {CONTACT.email}
            </a>
            <p className="flex items-center gap-2 text-xs text-muted">
              <Icon name="pin" className="h-4 w-4" />
              Santa Teresa, Costa Rica · UTC−6
            </p>
          </div>
          <div className="mt-10 rounded-xl bg-wash p-6">
            <p className="font-display text-2xl">Not sure which home?</p>
            <p className="mt-2 text-xs leading-6 text-muted">
              Choose “Help me choose” and tell us what matters to you. We’ll
              help narrow it down.
            </p>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
