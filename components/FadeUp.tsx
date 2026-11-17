import type { ReactNode } from "react";
// Content stays visible without JavaScript and during fast scrolling.
export default function FadeUp({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
