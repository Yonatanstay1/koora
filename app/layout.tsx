import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Motion from "@/components/Motion";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://koorarentals.com",
  ),
  title: {
    default: "Koora — Stays, Estate Management & Development",
    template: "%s · Koora",
  },
  description:
    "Homes, hospitality, estate management and development in Santa Teresa and Malpaís. Discover Koora’s local perspective.",
  openGraph: {
    title: "Koora · Villas in Santa Teresa, Costa Rica",
    description: "Hand-picked homes in Santa Teresa & Malpaís. Choose your dates, see what's free and send a booking request.",
    type: "website",
    siteName: "Koora Rentals",
    locale: "en_US",
    images: [{ url: "/og/koora.jpg", width: 1200, height: 630, alt: "Koora, Santa Teresa" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-paper focus:p-4"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <Motion />
      </body>
    </html>
  );
}
