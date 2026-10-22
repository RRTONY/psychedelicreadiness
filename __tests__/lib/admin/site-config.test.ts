import { describe, expect, it, vi } from "vitest";
import { githubRepo, netlifySiteName, previewUrlFor, SERVER_NAME, SITE_DOMAIN, SITE_ORIGIN, siteOrigin } from "@/lib/admin/site-config";

describe("site-config", () => {
  it("names this site", () => {
    expect(SITE_DOMAIN).toBe("psychedelicreadiness.com");
    expect(SITE_ORIGIN).toBe("https://psychedelicreadiness.com");
    expect(SERVER_NAME).toBe("psychedelicreadiness");
  });

  it("always edits RRTONY/psychedelicreadiness, whatever the environment says", () => {
    expect(githubRepo()).toEqual({ owner: "RRTONY", repo: "psychedelicreadiness" });
    vi.stubEnv("GITHUB_REPO", "acme/pri-site");
    expect(githubRepo()).toEqual({ owner: "RRTONY", repo: "psychedelicreadiness" });
  });

  it("builds preview links from NETLIFY_SITE_NAME, ignoring anything that isn't a site name", () => {
    vi.stubEnv("NETLIFY_SITE_NAME", "");
    expect(netlifySiteName()).toBe("psychedelicreadiness");
    expect(previewUrlFor(7)).toBe("https://deploy-preview-7--psychedelicreadiness.netlify.app");
    vi.stubEnv("NETLIFY_SITE_NAME", "pri-web");
    expect(previewUrlFor(7)).toBe("https://deploy-preview-7--pri-web.netlify.app");
    vi.stubEnv("NETLIFY_SITE_NAME", "evil.com/x");
    expect(netlifySiteName()).toBe("psychedelicreadiness");
  });

  it("checks MCP_SITE_ORIGIN, then NEXT_PUBLIC_SITE_URL, then the real domain, without a trailing slash", () => {
    vi.stubEnv("MCP_SITE_ORIGIN", "https://pri.netlify.app/");
    expect(siteOrigin()).toBe("https://pri.netlify.app");
    vi.stubEnv("MCP_SITE_ORIGIN", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.example.com");
    expect(siteOrigin()).toBe("https://staging.example.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteOrigin()).toBe("https://psychedelicreadiness.com");
  });
});
