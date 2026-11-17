import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
export const metadata: Metadata = {
  title: "Our story",
  description:
    "Get to know Koora, a local point of contact for your stay in Santa Teresa, Costa Rica.",
};
export default function AboutPage() {
  return (
    <div className="pt-32 lg:pt-44">
      <section className="container-koora grid items-end gap-8 pb-12 lg:grid-cols-2 lg:pb-16">
        <div>
          <p className="eyebrow">Our corner of Costa Rica</p>
          <h1 className="section-title mt-5">
            Beautiful places.
            <br />
            <em>Human connections.</em>
          </h1>
        </div>
        <p className="max-w-lg text-sm leading-8 text-muted">
          Koora connects homes, hospitality, estate management and development
          with life in Santa Teresa and Malpaís. Our work begins with a local
          perspective and a personal conversation.
        </p>
      </section>
      <div className="relative h-[400px] lg:h-[560px]">
        <Image
          src="/images/editorial/hero.webp"
          alt="A tropical Koora home with an outdoor pool and open living spaces"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <section className="container-koora grid gap-10 py-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24 lg:py-24">
        <p className="eyebrow">Homes · Hospitality · Life here</p>
        <div>
          <h2 className="font-display text-4xl lg:text-5xl">
            More at home,
            <br />
            even when you’re far away.
          </h2>
          <p className="mt-6 text-sm leading-8 text-muted">
            Our connection to Santa Teresa shapes how we work. We bring together
            a curated collection of stays, local property care and development
            support, with attention to both the people and the places involved.
          </p>
          <p className="mt-4 text-sm leading-8 text-muted">
            For guests, that means help choosing a home and planning the details
            of a stay. For owners, it means a conversation about operations and
            ongoing property care. For those creating something new, it means a
            local team to discuss development, construction and the work ahead.
          </p>
          <Link href="/contact" className="text-link mt-7">
            Get to know us <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
