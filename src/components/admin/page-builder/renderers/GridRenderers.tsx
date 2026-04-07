import React from "react";
import { Image } from "@/components/Image";
import { StyledWrapper } from "./BaseRenderer";
import type { ContentBlock } from "@/types/pageBuilder";

export const CardRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="py-6 px-4 bg-background">
      {d.title && <h3 className="text-[11px] font-bold text-foreground mb-3">{d.title as string}</h3>}
      <div className="grid grid-cols-2 gap-2">
        {Array.isArray(d.items) && d.items.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm p-2">
            <p className="text-[8px] font-bold text-foreground leading-tight line-clamp-2">{item.title}</p>
            {item.price && <p className="text-[9px] font-bold text-primary mt-0.5">{item.price}</p>}
          </div>
        ))}
      </div>
    </StyledWrapper>
  );
};

export const StatsRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="bg-primary text-primary-foreground py-6 px-4">
      {d.title && <h3 className="text-[11px] font-bold mb-1">{d.title as string}</h3>}
      <div className="flex gap-2 justify-center">
        {Array.isArray(d.items) && d.items.map((item: any, i: number) => (
          <div key={i} className="text-center flex-1">
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[8px] font-semibold text-secondary">{item.title}</p>
          </div>
        ))}
      </div>
    </StyledWrapper>
  );
};

export const FAQRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="py-5 px-4 bg-background">
      {d.title && <h3 className="text-[11px] font-bold text-foreground mb-2">{d.title as string}</h3>}
      {Array.isArray(d.items) && d.items.slice(0, 4).map((item: any, i: number) => (
        <div key={i} className="border border-border rounded-md px-2.5 py-1.5 mt-1.5 text-[9px] bg-muted/50">{item.question}</div>
      ))}
    </StyledWrapper>
  );
};

export const LogoRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="py-5 px-4 bg-background">
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.isArray(d.items) && d.items.map((item: any, i: number) => (
          <div key={i} className="bg-muted rounded-md px-2 py-1.5 text-[8px] border border-border">
            {item.mediaType === "image" && item.image ? (
              <img src={typeof item.image === "string" ? item.image : item.image.small} alt="" className="h-5 w-auto" />
            ) : <span>{item.title}</span>}
          </div>
        ))}
      </div>
    </StyledWrapper>
  );
};
