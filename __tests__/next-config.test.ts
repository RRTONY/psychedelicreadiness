import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next.config headers", () => {
  it("keeps every page out of search results while the site is on hold (Sam, 2026-11-11)", async () => {
    const rules = await nextConfig.headers!();
    const hold = rules.find((r) => r.source === "/:path*" && !r.has && r.headers.some((h) => h.key === "X-Robots-Tag"));
    expect(hold?.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  });
});
