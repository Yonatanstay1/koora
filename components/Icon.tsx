import type { SVGProps } from "react";
const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  sun: "M12 3V1m0 22v-2M3 12H1m22 0h-2M4.2 4.2 2.8 2.8m18.4 18.4-1.4-1.4m0-15.6 1.4-1.4M2.8 21.2l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  leaf: "M20 3C9 2 3 8 5 15c2 6 14 7 15-12ZM5 21 15 9",
  wave: "M2 8c3-5 7 5 10 0s7 5 10 0M2 15c3-5 7 5 10 0s7 5 10 0",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1 5 6 6",
  chat: "M21 11a9 9 0 0 1-9 9H3l1.5-4A9 9 0 1 1 21 11Z",
  bed: "M3 18v3m18-3v3M3 12V5h18v7M2 18v-6h20v6H2Zm4-6V8h5v4m2 0V8h5v4",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-3a4 4 0 0 1 0 8m5 10v-2a4 4 0 0 0-3-4",
};
export default function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
