import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("allows the site, keeps the API and MCP sign-in out, and points at the sitemap", () => {
    expect(robots()).toEqual({
      rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/oauth/"] }],
      sitemap: "https://psychedelicreadiness.com/sitemap.xml",
    });
  });
});
