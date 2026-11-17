import type { Metadata } from "next";
import { CONTACT } from "@/data/villas";
export const metadata: Metadata = { title: "Privacy & your inquiry" };
export default function PrivacyPage() {
  return (
    <article className="container-koora pb-24 pt-32 lg:pt-44">
      <div className="max-w-2xl">
        <p className="eyebrow">Your details</p>
        <h1 className="section-title mt-5">
          Privacy &<br />
          <em>your inquiry.</em>
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-8 text-muted">
          <p>
            When you send an inquiry, Koora uses the name, email address, phone
            number, inquiry category and message you provide to respond to your
            request. For stay inquiries, this may also include travel dates,
            group size and property preference. Please do not include payment
            card details, passport numbers or other sensitive documents.
          </p>
          <p>
            Inquiries are stored by the website service and may be sent to
            Koora’s team by email when email delivery is enabled. Your details
            are not used to subscribe you to marketing. Sending an inquiry does
            not create a reservation.
          </p>
          <p>
            If you choose WhatsApp or email, your device opens that service so
            you can send your message directly. Those providers process
            information under their own privacy policies. The website cannot
            confirm that a WhatsApp draft has been sent.
          </p>
          <p>
            The inquiry service uses a short-lived hashed network identifier to
            limit spam. It also records a request identifier to prevent
            duplicate submissions when you retry.
          </p>
          <p>
            To ask about an inquiry, correct your information or request
            deletion, contact{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline">
              {CONTACT.email}
            </a>
            . Include your inquiry reference if you have one.
          </p>
        </div>
      </div>
    </article>
  );
}
