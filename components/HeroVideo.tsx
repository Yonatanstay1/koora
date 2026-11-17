"use client";
import { useRef, useState } from "react";
export default function HeroVideo({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  return (
    <>
      <video
        ref={video}
        className="absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/editorial/hero.webp"
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="absolute right-6 top-28 border border-white/50 bg-black/60 px-4 py-2 text-xs motion-reduce:hidden"
        aria-label={paused ? "Play background video" : "Pause background video"}
        onClick={async () => {
          if (!video.current) return;
          if (paused) {
            try {
              await video.current.play();
              setPaused(false);
            } catch {
              setPaused(true);
            }
          } else {
            video.current.pause();
            setPaused(true);
          }
        }}
      >
        {paused ? "Play film" : "Pause film"}
      </button>
    </>
  );
}
