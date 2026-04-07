import React from "react";
import type { ContentBlock, BlockStyle, TextAlignment } from "@/types/pageBuilder";
import { getImageUrl } from "./rendererUtils";

export const buildBlockStyle = (style?: BlockStyle): React.CSSProperties => {
  if (!style) return {};
  const s: React.CSSProperties = {};
  if (style.textColor) s.color = style.textColor;
  if (style.bgColor) s.backgroundColor = style.bgColor;
  if (style.bgImage) {
    const url = getImageUrl(style.bgImage);
    s.backgroundImage = `url(${url})`;
    s.backgroundSize = "cover";
    s.backgroundPosition = "center";
  }
  const units = (v: string | undefined) => v ? `${v}px` : undefined;
  s.paddingTop = units(style.paddingTop);
  s.paddingBottom = units(style.paddingBottom);
  s.paddingLeft = units(style.paddingLeft);
  s.paddingRight = units(style.paddingRight);
  s.marginTop = units(style.marginTop);
  s.marginBottom = units(style.marginBottom);
  return s;
};

export const alignClass = (a?: TextAlignment) =>
  a === "left" ? "text-left" : a === "right" ? "text-right" : "text-center";

export const StyledWrapper = ({
  block,
  defaultClass,
  children,
}: {
  block: ContentBlock;
  defaultClass: string;
  children: React.ReactNode;
}) => {
  const style = buildBlockStyle(block.style);
  const hasBgImage = block.style?.bgImage;

  return (
    <div className={`relative ${defaultClass}`} style={style}>
      {hasBgImage && block.style?.bgOverlay && (
        <div className="absolute inset-0" style={{ backgroundColor: block.style.bgOverlay }} />
      )}
      <div className={`relative z-10 ${alignClass(block.alignment)}`}>{children}</div>
    </div>
  );
};
