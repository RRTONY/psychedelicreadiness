import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

async function load(id: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", id);
  return (await import("@/components/google-analytics")).GoogleAnalytics;
}

describe("GoogleAnalytics", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("renders nothing while analytics is off", async () => {
    const GoogleAnalytics = await load("");
    expect(GoogleAnalytics()).toBeNull();
  });

  it("loads the tag on the live domain only, without the query string", async () => {
    const GoogleAnalytics = await load("G-TEST1234");
    const el = GoogleAnalytics();
    expect(el).not.toBeNull();
    const code = String(el!.props.children);
    expect(code).toContain('"G-TEST1234"');
    expect(code).toContain('h !== "psychedelicreadiness.com"');
    expect(code).toContain("window.location.origin + window.location.pathname");
    expect(renderToStaticMarkup(el!)).toBeDefined();
  });
});
