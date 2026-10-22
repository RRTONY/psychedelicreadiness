import { describe, expect, it, vi } from "vitest";
import type { ReactElement, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout";

vi.mock("next/font/google", () => {
  const font = () => ({ className: "font-test", variable: "--font-test", style: { fontFamily: "test" } });
  return { Playfair_Display: font, DM_Mono: font, Source_Sans_3: font };
});

type El = ReactElement<{ lang?: string; className?: string; children: ReactNode }>;

function renderLayout(children: ReactNode) {
  const html = RootLayout({ children } as Parameters<typeof RootLayout>[0]) as El;
  const body = html.props.children as El;
  render(<div>{body.props.children}</div>);
  return { html, body };
}

describe("root layout", () => {
  it("sets the site's title, description, address and share defaults", () => {
    expect(metadata.title).toEqual({ default: "Psychedelic Readiness Index", template: "%s" });
    expect(metadata.description).toMatch(/^39 plant medicines\./);
    expect(metadata.metadataBase?.toString()).toBe("https://psychedelicreadiness.com/");
    expect(metadata.openGraph).toMatchObject({ siteName: "Psychedelic Readiness Index", type: "website" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.authors).toEqual([{ name: "Tony Greenberg", url: "https://tonygreenberg.com" }]);
  });

  it("is an English document that prints on white", () => {
    const { html, body } = renderLayout(<p>page</p>);
    expect(html.type).toBe("html");
    expect(html.props.lang).toBe("en");
    expect(body.props.className).toContain("print:bg-white");
  });

  it("puts the page inside <main id=main-content> with a skip link, header and footer", () => {
    renderLayout(<p>The page content</p>);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveTextContent("The page content");
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("adds WebSite structured data for this domain", () => {
    renderLayout(<p>x</p>);
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent || "{}"));
    expect(ld).toEqual([
      expect.objectContaining({ "@type": "WebSite", name: "Psychedelic Readiness Index", url: "https://psychedelicreadiness.com" }),
    ]);
  });
});
