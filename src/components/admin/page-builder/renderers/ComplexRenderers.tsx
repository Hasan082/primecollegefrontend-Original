import React from "react";
import { Image } from "@/components/Image";
import { StyledWrapper, alignClass, buildBlockStyle } from "./BaseRenderer";
import { iconMap, getImageUrl } from "./rendererUtils";
import type { ContentBlock } from "@/types/pageBuilder";

export const ImageTextRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="bg-primary text-primary-foreground py-6 px-5">
      <div className={`flex gap-4 ${d.imagePosition === "left" ? "flex-row" : "flex-row-reverse"}`}>
        {d.image && (
          <div className="flex-1 rounded overflow-hidden">
            {typeof d.image === "string" ? (
              <img src={d.image} alt="" className="w-full h-20 object-cover rounded" />
            ) : (
              <Image image={d.image as any} className="w-full h-20 object-cover rounded" />
            )}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-[11px] font-bold leading-snug mb-1">{d.headline as string}</h3>
          {(Array.isArray(d.paragraphs) ? d.paragraphs : [d.description]).map((p: any, i: number) => (
            <div key={i} className="text-[9px] opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
};

export const WhyUsRenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  return (
    <StyledWrapper block={block} defaultClass="bg-muted py-6 px-4">
      {d.title && <h3 className="text-[11px] font-bold text-foreground mb-1">{d.title as string}</h3>}
      {d.content && <p className="text-[9px] text-muted-foreground mb-3 max-w-[90%] mx-auto">{d.content as string}</p>}
      <div className="flex gap-2 justify-center">
        {Array.isArray(d.items) && d.items.map((item: any, i: number) => {
          const Icon = iconMap[item.icon || ""] || iconMap.Users;
          return (
            <div key={i} className="flex-1 text-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-1">
                <Icon className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] font-semibold text-foreground">{item.title}</p>
            </div>
          );
        })}
      </div>
    </StyledWrapper>
  );
};

export const CTARenderer = ({ block }: { block: ContentBlock }) => {
  const d = block.data as any;
  const bgUrl = getImageUrl(d.bgImage);
  const usesImage = d.bgMode === "image" && bgUrl;
  const style = { 
    ...(usesImage ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
    ...buildBlockStyle(block.style)
  };
  return (
    <div className={`relative py-8 px-5 ${usesImage ? '' : 'bg-primary text-primary-foreground'} ${alignClass(block.alignment)}`} style={style}>
      {usesImage && <div className="absolute inset-0" style={{ backgroundColor: (d.overlayColor as string) || "rgba(0,0,0,0.5)" }} />}
      <div className={`relative z-10 ${usesImage ? 'text-white' : ''}`}>
        <h3 className="text-[12px] font-bold">{d.title as string}</h3>
        {d.content && <p className="text-[9px] opacity-80 mt-1 max-w-[85%] mx-auto leading-relaxed">{d.content as string}</p>}
      </div>
    </div>
  );
};
