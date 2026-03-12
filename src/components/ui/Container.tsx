import type { CSSProperties, ReactNode } from "react";

export function Container({
  children,
  style,
  maxWidth = 960,
}: {
  children: ReactNode;
  style?: CSSProperties;
  maxWidth?: number;
}) {
  return (
    <div
      style={{
        maxWidth,
        margin: "0 auto",
        padding: "24px 16px 80px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
