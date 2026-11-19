"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Scroll reveals. Hiding only starts once this runs, so the page never stays blank
// if scripts fail. Titles, eyebrows and links reveal automatically; anything else
// opts in with data-reveal (data-reveal="img" = photo unveil).
const AUTO = "main .section-title, main .eyebrow, main .text-link";

export default function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    let first = !root.classList.contains("motion-ready");
    const scan = () => {
      document.querySelectorAll(AUTO).forEach((el) => {
        if (!el.hasAttribute("data-reveal") && !el.closest("main > section:first-child")) el.setAttribute("data-reveal", "");
      });
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        // Already on screen at first paint: show at once, no flash.
        if (first && el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("is-in");
        else io.observe(el);
      });
      if (first) {
        root.classList.add("motion-ready");
        first = false;
      }
    };
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return null;
}
