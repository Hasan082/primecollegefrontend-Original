import React from "react";
import { Image } from "@/components/Image";
import { StyledWrapper, buildBlockStyle, alignClass } from "./BaseRenderer";
import type { ContentBlock } from "@/types/pageBuilder";

export const HeroRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  const slides = Array.isArray(d.slides) ? d.slides : null;
  const slide = slides ? slides[0] : d; // Show first slide as preview

  return (
    <StyledWrapper block={block} defaultClass="bg-primary text-primary-foreground p-8 min-h-[140px] flex items-center justify-center overflow-hidden">
      {slide?.image && (
        <div className="absolute inset-0">
          {typeof slide.image === "string" ? (
            <img src={slide.image} alt="" className="w-full h-full object-cover opacity-40" />
          ) : (
            <Image image={slide.image} className="w-full h-full object-cover opacity-40" />
          )}
        </div>
      )}
      <div className="relative z-10 w-full">
        {slides && slides.length > 1 && (
          <span className="absolute -top-6 right-0 bg-secondary px-2 py-0.5 rounded text-[7px] font-bold text-secondary-foreground shadow-sm">
            Slider: {slides.length} Slides
          </span>
        )}
        {slide?.category && <span className="text-[8px] uppercase tracking-wider font-bold text-secondary">{slide.category}</span>}
        <h2 className="text-base font-bold leading-tight mt-0.5">{slide?.title || (d.title as string)}</h2>
        {(slide?.subtitle || d.subtitle) && <p className="text-[10px] opacity-80 mt-1 max-w-[80%] mx-auto">{slide?.subtitle || (d.subtitle as string)}</p>}
        {slide?.price && <p className="text-sm font-bold mt-2 text-secondary">{slide.price}</p>}
        {(slide?.cta || d.ctaLabel) && (
          <span className="inline-block mt-3 px-4 py-1.5 bg-secondary text-secondary-foreground rounded text-[9px] font-bold shadow-md">
            {slide?.cta || (d.ctaLabel as string)}
          </span>
        )}
      </div>
    </StyledWrapper>
  );
};

export const ImageRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="bg-muted min-h-[100px] flex flex-col items-center justify-center">
      {d.image ? (
        <div className="w-full h-full">
          {typeof d.image === "string" ? (
            <img src={d.image} alt={(d.alt as string) || ""} className="w-full max-h-60 object-cover" />
          ) : (
            <Image image={d.image as any} alt={(d.alt as string) || ""} className="w-full max-h-60 object-cover" />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/30">
          <span className="text-[20px]">🖼</span>
          <p className="text-[10px]">No image selected</p>
        </div>
      )}
      {d.caption && <p className="text-[8px] text-muted-foreground text-center py-2 bg-background w-full border-t border-border">{d.caption as string}</p>}
    </StyledWrapper>
  );
};

export const TextRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  const textAlign = (d.alignment as string) || block.alignment || "center";
  const tAlignClass = alignClass(textAlign as any);
  return (
    <div className={`py-8 px-6 bg-background ${tAlignClass}`} style={buildBlockStyle(block.style)}>
      {d.title && <h3 className="text-[13px] font-bold text-foreground mb-3">{d.title as string}</h3>}
      {d.content && typeof d.content === "string" && (
        <div className={`text-[11px] text-muted-foreground leading-relaxed max-w-[90%] ${textAlign === "center" ? "mx-auto" : ""} prose prose-sm overflow-x-auto`} 
             dangerouslySetInnerHTML={{ __html: d.content }} />
      )}
    </div>
  );
};
