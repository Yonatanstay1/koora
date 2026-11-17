"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
export default function VillaGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prior;
    };
  }, [open]);
  const show = (i: number) => {
    trigger.current = document.activeElement as HTMLElement;
    setActive(i);
    setOpen(true);
  };
  const close = () => {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  };
  const step = (n: number) =>
    setActive((i) => (i + n + images.length) % images.length);
  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.65fr_1fr]">
        <button
          onClick={() => show(0)}
          aria-label={`Open photos of ${name}`}
          className="relative aspect-[4/3] overflow-hidden rounded-l-lg sm:aspect-auto sm:min-h-[440px]"
        >
          <Image
            src={images[0]}
            alt={`${name}, main view`}
            fill
            priority
            sizes="(max-width:640px) 100vw, 65vw"
            className="object-cover"
          />
          <span className="absolute bottom-4 left-4 rounded-full bg-paper px-4 py-2 text-xs">
            View all {images.length} photos ↗
          </span>
        </button>
        <div className="hidden grid-rows-2 gap-2 sm:grid">
          {images.slice(1, 3).map((src, i) => (
            <button
              key={src}
              onClick={() => show(i + 1)}
              aria-label={`Open photo ${i + 2} of ${name}`}
              className="relative min-h-[216px] overflow-hidden rounded-r-lg"
            >
              <Image
                src={src}
                alt={`${name}, view ${i + 2}`}
                fill
                sizes="35vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      {open && (
        <dialog
          ref={dialog}
          aria-label={`Photos of ${name}`}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClose={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none bg-[#16231D] text-white backdrop:bg-black/80"
        >
          <div className="flex h-full flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="max-w-[75%] text-sm">
                {name}
                <span className="ml-3 text-white/60">
                  {active + 1} / {images.length}
                </span>
              </p>
              <button
                onClick={close}
                autoFocus
                aria-label="Close gallery"
                className="flex h-12 w-12 items-center justify-center"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="relative my-4 flex-1">
              <Image
                src={images[active]}
                alt={`${name}, photo ${active + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <button
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink"
              >
                <Icon name="arrow" className="rotate-180" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink"
              >
                <Icon name="arrow" />
              </button>
            </div>
            <div className="no-scrollbar flex justify-start gap-3 overflow-x-auto py-2 sm:justify-center">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={active === i}
                  className={`relative h-14 w-20 shrink-0 ${active === i ? "ring-2 ring-paper" : "opacity-60"}`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
