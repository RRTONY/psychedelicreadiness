import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next.config headers", () => {
  it("keeps every page out of search results while the site is on hold (Sam, 2026-11-11)", async () => {
    const rules = await nextConfig.headers!();
    const hold = rules.find((r) => r.source === "/:path*" && !r.has && r.headers.some((h) => h.key === "X-Robots-Tag"));
    expect(hold?.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  });
});

describe("next.config redirects", () => {
  it("sends /medicine and /medicines to the Index and /heroes to Tony's heroes page", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({ source: "/medicine", destination: "/", permanent: true });
    expect(redirects).toContainEqual({ source: "/medicines", destination: "/", permanent: true });
    expect(redirects).toContainEqual({
      source: "/heroes",
      destination: "https://tonygreenberg.com/the-territory",
      permanent: true,
    });
  });

  it("keeps tonygreenberg.com's old Index addresses working here", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({ source: "/psychedelic-readiness-index", destination: "/", permanent: true });
    expect(redirects).toContainEqual({ source: "/pri", destination: "/", permanent: true });
  });
});
