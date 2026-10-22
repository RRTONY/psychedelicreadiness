import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { ALL_PAGES, FOOTER_NAV, PRIMARY_NAV } from "@/lib/site-nav";

// Every nav link must point at a real page in src/app.
const pageFile = (href: string) => path.resolve("src/app", `.${href}`, "page.tsx");

describe("site-nav", () => {
  it("every header and footer link is a real page", () => {
    for (const { href } of [...PRIMARY_NAV, ...FOOTER_NAV.flatMap((g) => g.links)]) {
      expect(href.startsWith("/"), href).toBe(true);
      expect(existsSync(pageFile(href)), href).toBe(true);
    }
  });

  it("the header starts with the Index (the homepage)", () => {
    expect(PRIMARY_NAV[0]).toEqual({ href: "/", label: "The Index" });
  });

  it("ALL_PAGES lists each footer page once, in footer order", () => {
    expect(ALL_PAGES).toEqual([...new Set(FOOTER_NAV.flatMap((g) => g.links.map((l) => l.href)))]);
    expect(new Set(ALL_PAGES).size).toBe(ALL_PAGES.length);
    expect(ALL_PAGES).toEqual(
      expect.arrayContaining(["/", "/pri-calibration", "/pri-efficacy", "/medicine-sequencing", "/iboga-ibogaine", "/iboga-compass", "/peyote-mescaline", "/facilitator-index"]),
    );
  });
});
