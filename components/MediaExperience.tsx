import type { Media } from "@/data/site";
export default function MediaExperience({
  media,
  name,
}: {
  media: Media;
  name: string;
}) {
  if (!media.videoUrl && !media.tourUrl && !media.floorPlan) return null;
  return (
    <section className="my-12 space-y-8" aria-label={`Explore ${name}`}>
      {media.videoUrl && (
        <div>
          <h2 className="mb-5 text-3xl">A closer look.</h2>
          <iframe
            src={media.videoUrl}
            title={`${name} video`}
            loading="lazy"
            className="aspect-video w-full border-0"
            allow="fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
      {media.tourUrl && (
        <details className="border-y border-line py-6">
          <summary className="cursor-pointer text-sm uppercase tracking-widest">
            Explore {name} in 360° ↗
          </summary>
          <iframe
            src={media.tourUrl}
            title={`${name} interactive 360 degree tour`}
            loading="lazy"
            className="mt-6 aspect-[4/3] w-full border-0"
            allow="fullscreen; gyroscope; accelerometer"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </details>
      )}
      {media.floorPlan && (
        <a
          className="text-link"
          href={media.floorPlan}
          target="_blank"
          rel="noreferrer"
        >
          View floor plan ↗
        </a>
      )}
    </section>
  );
}
