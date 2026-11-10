import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import TermsPage, { metadata } from "@/app/terms/page";
import { ACKNOWLEDGE, LEGAL } from "@/lib/content/pri-disclaimer";
import { ALL_PAGES } from "@/lib/site-nav";

describe("/terms", () => {
  it("has its own title, description, canonical and og:url, and is in the footer", () => {
    expect(metadata.title).toBe("Terms of Use — Psychedelic Readiness Index");
    expect(String(metadata.description).length).toBeLessThanOrEqual(160);
    expect(metadata.alternates?.canonical).toBe("/terms");
    expect(metadata.openGraph).toMatchObject({ url: "/terms" });
    expect(ALL_PAGES).toContain("/terms");
  });

  it("is made of the approved disclaimer text and links to the full disclaimer", () => {
    render(<TermsPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual([...ACKNOWLEDGE.items]);
    for (const p of LEGAL.paragraphs) expect(screen.getByText(p)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "full disclaimer" })).toHaveAttribute("href", "/disclaimer");
  });
});
