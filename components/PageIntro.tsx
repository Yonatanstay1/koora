import Image from "next/image";
export default function PageIntro({
  label,
  title,
  description,
  image,
}: {
  label: string;
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <>
      <section className="container-koora grid gap-8 pb-14 pt-36 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:pt-44">
        <div>
          <p className="eyebrow">{label}</p>
          <h1 className="section-title mt-6">{title}</h1>
        </div>
        <p className="max-w-lg text-sm leading-8 text-muted">{description}</p>
      </section>
      {image && (
        <div className="relative h-[45vh] min-h-[280px] max-h-[620px]">
          <Image
            src={image}
            alt={label}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
    </>
  );
}
