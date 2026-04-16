import { describe, expect, it } from "vitest";
import {
  getAllowedBlockTypesForPage,
  getFallbackBlocksForPageType,
  getPreviewPath,
  getRenderableBlocks,
  normalizePageBlocksForSlug,
} from "@/utils/pageBuilder";

describe("pageBuilder defaults", () => {
  it("does not inject a hero banner for core static pages", () => {
    expect(getFallbackBlocksForPageType("static", "home").some((block) => block.type === "hero")).toBe(false);
    expect(getFallbackBlocksForPageType("static", "about").some((block) => block.type === "hero")).toBe(false);
    expect(getFallbackBlocksForPageType("static", "contact").some((block) => block.type === "hero")).toBe(false);
  });

  it("injects a hero banner for generic static pages", () => {
    const blocks = getFallbackBlocksForPageType("static", "our-team");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe("hero");
  });

  it("normalizes empty generic static pages with a hero banner", () => {
    const blocks = getRenderableBlocks([], "our-team");
    expect(blocks[0]?.type).toBe("hero");
  });

  it("keeps core static pages hero-free during normalization", () => {
    const blocks = normalizePageBlocksForSlug([], "about");
    expect(blocks.some((block) => block.type === "hero")).toBe(false);
  });

  it("keeps home and qualification pages hero-free during normalization", () => {
    const heroBlock = { id: "hero", type: "hero", label: "Hero Banner", data: {} } as any;
    const qualificationHeroBlock = { id: "qhero", type: "qualification_hero", label: "Qualification Hero", data: {} } as any;
    expect(normalizePageBlocksForSlug([heroBlock, qualificationHeroBlock], "home").some((block) => block.type === "hero" || block.type === "qualification_hero")).toBe(false);
    expect(normalizePageBlocksForSlug([heroBlock, qualificationHeroBlock], "qualification-level-7").some((block) => block.type === "hero" || block.type === "qualification_hero")).toBe(false);
  });

  it("hides hero only on core and qualification pages in the add-block modal", () => {
    expect(getAllowedBlockTypesForPage("static", "home")?.includes("hero")).toBe(false);
    expect(getAllowedBlockTypesForPage("static", "about")?.includes("hero")).toBe(false);
    expect(getAllowedBlockTypesForPage("static", "contact")?.includes("hero")).toBe(false);
    expect(getAllowedBlockTypesForPage("qualification_detail", "qualification-level-7")?.includes("hero")).toBe(false);
    expect(getAllowedBlockTypesForPage("static", "our-team")?.includes("hero")).toBe(true);
    expect(getAllowedBlockTypesForPage("general", "our-team")?.includes("hero")).toBe(true);
  });

  it("keeps qualification slider out of the add-block modal", () => {
    expect(getAllowedBlockTypesForPage("static", "home")?.includes("qualification_slider")).toBe(false);
    expect(getAllowedBlockTypesForPage("general", "our-team")?.includes("qualification_slider")).toBe(false);
  });

  it("shows generic static pages in the pages route format", () => {
    expect(
      getPreviewPath({
        slug: "our-team",
        pageType: "static",
        isHomePage: false,
      }),
    ).toBe("/page/our-team");
  });
});
