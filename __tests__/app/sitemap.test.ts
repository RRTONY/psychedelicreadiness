import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { ALL_PAGES } from "@/lib/site-nav";

describe("sitemap", () => {
  it("lists every page on psychedelicreadiness.com, homepage first and highest", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(ALL_PAGES.length);
    expect(entries[0]).toMatchObject({ url: "https://psychedelicreadiness.com", priority: 1 });
    expect(entries.map((e) => e.url)).toContain("https://psychedelicreadiness.com/facilitator-index");
    for (const e of entries) {
      expect(e.url.startsWith("https://psychedelicreadiness.com")).toBe(true);
      expect(e.url.endsWith("/")).toBe(false);
    }
    expect(entries.slice(1).every((e) => e.priority === 0.7)).toBe(true);
  });
});
