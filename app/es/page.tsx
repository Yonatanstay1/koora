import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { CONTACT } from "@/data/villas";
export const metadata = {
  title: "Koora — Santa Teresa y Malpaís",
  description:
    "Estancias, gestión de propiedades y desarrollo con un equipo local.",
};
export default function Page() {
  return (
    <div lang="es">
      <PageIntro
        label="Santa Teresa · Malpaís · Costa Rica"
        title="Un hogar. Una forma de vivir."
        description="Koora reúne hospitalidad, cuidado de propiedades y desarrollo. Un equipo local para acompañarte en Santa Teresa y Malpaís."
        image="/images/editorial/hero.webp"
      />
      <section className="container-koora py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            [
              "Estancias",
              "Encuentra una villa para tu próxima visita. Cuéntanos tus fechas y lo que necesitas.",
            ],
            [
              "Gestión de propiedades",
              "Conecta el cuidado de tu hogar, las operaciones y la atención a los huéspedes con un equipo local.",
            ],
            [
              "Desarrollo",
              "Hablemos de tu proyecto: desarrollo, construcción, gestión y acabados.",
            ],
          ].map(([t, b]) => (
            <div className="border-t border-line pt-6" key={t}>
              <h2 className="text-2xl">{t}</h2>
              <p className="mt-5 text-sm leading-7 text-muted">{b}</p>
            </div>
          ))}
        </div>
        <a
          href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola Koora, me gustaría hablar con su equipo en español.")}`}
          className="btn-primary mt-10"
        >
          Hablemos por WhatsApp ↗
        </a>
        <p className="mt-10 text-xs leading-6 text-muted">
          Esta es nuestra introducción en español. Las páginas detalladas están
          disponibles actualmente en inglés; puedes comunicarte con el equipo en
          español.
        </p>
        <Link href="/" className="text-link mt-4">
          Explorar el sitio en inglés ↗
        </Link>
      </section>
    </div>
  );
}
