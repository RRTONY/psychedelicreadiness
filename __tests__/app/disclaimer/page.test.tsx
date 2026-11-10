import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DisclaimerPage, { metadata } from "@/app/disclaimer/page";
import { ACKNOWLEDGE, COUNCIL_REMINDER, LEGAL, SCORE_CAN_TELL, TONY_NOTE, WHAT_THIS_IS } from "@/lib/content/pri-disclaimer";
import { ALL_PAGES } from "@/lib/site-nav";

describe("/disclaimer", () => {
  it("has its own title, description and canonical, and is in the footer and sitemap", () => {
    expect(metadata.title).toBe("Full Disclaimer — Psychedelic Readiness Index");
    expect(metadata.description).toMatch(/licensed clinician/);
    expect(metadata.alternates?.canonical).toBe("/disclaimer");
    expect(ALL_PAGES).toContain("/disclaimer");
  });

  it("renders one H1 and every section of the full disclaimer", () => {
    render(<DisclaimerPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Full Disclaimer");
    expect(screen.getByText(COUNCIL_REMINDER.title)).toBeInTheDocument();
    for (const t of [SCORE_CAN_TELL.title, TONY_NOTE.title, WHAT_THIS_IS.title, ACKNOWLEDGE.title, LEGAL.title]) {
      expect(screen.getByRole("heading", { level: 2, name: t })).toBeInTheDocument();
    }
    for (const p of [...SCORE_CAN_TELL.paragraphs, ...WHAT_THIS_IS.items, ...ACKNOWLEDGE.items, ...LEGAL.paragraphs]) {
      expect(screen.getByText(p)).toBeInTheDocument();
    }
    expect(screen.getByText(/not medical advice/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to the Index/ })).toHaveAttribute("href", "/");
  });
});
