import Image from "next/image";
import Link from "next/link";
import type { Villa } from "@/data/villas";
import Icon from "./Icon";
export default function VillaCard({
  villa,
  query = "",
  index,
  stay,
}: {
  villa: Villa;
  query?: string;
  index?: number;
  // Set when the guest searched dates: the home is free, with the estimated total if known.
  stay?: { total?: string; nights: number };
}) {
  const href = `/villas/${villa.slug}${query ? "?" + query : ""}`;
  return (
    <article className="group min-w-0">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden rounded-[3px] bg-wash"
      >
        <Image
          src={villa.images[0]}
          alt={`${villa.name}, ${villa.cityLabel}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3 py-1.5 text-[10px] tracking-wide">
          {villa.tourUrl ? "360° TOUR" : villa.bestFor[0]}
        </span>
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink">
          <Icon name="arrow" className="h-4 w-4" />
        </span>
      </Link>
      <div className="pt-5">
        <p className="eyebrow">
          {villa.cityLabel}
          {index !== undefined && (
            <span className="float-right text-muted">0{index + 1}</span>
          )}
        </p>
        <h2 className="mt-2 font-display text-[30px] leading-[1.1]">
          <Link href={href}>{villa.name}</Link>
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>
            {villa.beds} {villa.beds === 1 ? "bedroom" : "bedrooms"}
          </span>
          <span>{villa.sleeps} guests</span>
          <span>
            {villa.baths} {villa.baths === 1 ? "bath" : "baths"}
          </span>
        </div>
        <Link href={href} className="text-link mt-4 text-xs">
          View property ↗
        </Link>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          {stay ? (
            <>
              <p className="text-xs text-muted">
                <span className="mr-1 inline-block rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">Free</span>
                {stay.total ? (
                  <>
                    <span className="text-base font-medium text-ink">{stay.total}</span> · {stay.nights}{" "}
                    {stay.nights === 1 ? "night" : "nights"}
                  </>
                ) : (
                  "Price from our team"
                )}
              </p>
              <span className="text-[10px] text-muted">USD · estimated</span>
            </>
          ) : (
          <>
          <p className="text-xs text-muted">
            Listed from{" "}
            <span className="text-base font-medium text-ink">
              ${villa.pricePerNight.toLocaleString()}
            </span>{" "}
            / night
          </p>
          <span className="text-[10px] text-muted">
            USD · dates confirmed by team
          </span>
          </>
          )}
        </div>
      </div>
    </article>
  );
}
