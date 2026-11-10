import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "@/app/about/page";
import { TONY_NOTE, WHAT_THIS_IS } from "@/lib/content/pri-disclaimer";
import { ALL_PAGES } from "@/lib/site-nav";

describe("/about", () => {
  it("has its own title, description, canonical and og:url, and is in the footer", () => {
    expect(metadata.title).toBe("About — Psychedelic Readiness Index");
    expect(metadata.alternates?.canonical).toBe("/about");
    expect(metadata.openGraph).toMatchObject({ url: "/about" });
    expect(ALL_PAGES).toContain("/about");
  });

  it("shows Tony's note, what the Index is and is not, and links to the disclaimer", () => {
    render(<AboutPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(`“${TONY_NOTE.quote}”`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: TONY_NOTE.byline })).toHaveAttribute("href", "https://tonygreenberg.com");
    for (const item of WHAT_THIS_IS.items) expect(screen.getByText(item)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "full disclaimer" })).toHaveAttribute("href", "/disclaimer");
  });
});
