"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Click-to-select wrapper shared by header/section/footer previews. Renders as a plain
 * <div> (not a <button>) when non-interactive, so the model-picker thumbnails stay
 * inert and don't pick up focus/hover affordances meant only for the live editor.
 */
export function Selectable({
  interactive,
  selected,
  onSelect,
  corAcento,
  className,
  style,
  children,
  as = "div",
}: {
  interactive: boolean;
  selected: boolean;
  onSelect?: () => void;
  corAcento: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "header" | "footer";
}) {
  const outline: CSSProperties = selected && interactive ? { outline: `2px solid ${corAcento}`, outlineOffset: -2 } : {};
  const Tag = as;

  if (!interactive) {
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={{ ...style, ...outline, cursor: "pointer" }}
      onClick={(e) => {
        e.preventDefault();
        onSelect?.();
      }}
    >
      {children}
    </Tag>
  );
}
