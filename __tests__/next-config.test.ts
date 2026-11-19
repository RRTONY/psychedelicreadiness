import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next.config headers", () => {
  it("lets search engines index psychedelicreadiness.com (hold lifted with Sam's approval)", async () => {
    const rules = await nextConfig.headers!();
    const domainWide = rules.filter((r) => !r.has && r.headers.some((h) => h.key === "X-Robots-Tag"));
    expect(domainWide).toHaveLength(0);
  });

  it("still keeps the Netlify copies out of search results", async () => {
    const rules = await nextConfig.headers!();
    const netlify = rules.find((r) => r.has?.some((h) => h.type === "host"));
    expect(netlify?.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
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
