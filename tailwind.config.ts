import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FFFFFF",
        muted: "#626262",
        line: "#DDDDDA",
        wash: "#F3F3F0",
        clay: "#444444",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-dm-sans)", "sans-serif"],
      },
      fontSize: {
        display: [
          "clamp(3.7rem, 7vw, 7.25rem)",
          { lineHeight: "0.97", letterSpacing: "-0.045em" },
        ],
        "display-sm": [
          "clamp(2.75rem, 4.5vw, 4.75rem)",
          { lineHeight: "1.04", letterSpacing: "-0.035em" },
        ],
      },
      maxWidth: { site: "1440px" },
    },
  },
  plugins: [],
};
export default config;
