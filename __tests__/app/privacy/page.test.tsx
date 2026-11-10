import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage, { metadata } from "@/app/privacy/page";
import { LAST_REVIEWED, PRIVACY } from "@/lib/content/site-pages";
import { ALL_PAGES } from "@/lib/site-nav";

describe("/privacy", () => {
  it("has its own title, description, canonical and og:url, and is in the footer", () => {
    expect(metadata.title).toBe("Privacy — Psychedelic Readiness Index");
    expect(String(metadata.description).length).toBeLessThanOrEqual(160);
    expect(metadata.alternates?.canonical).toBe("/privacy");
    expect(metadata.openGraph).toMatchObject({ url: "/privacy", siteName: "Psychedelic Readiness Index" });
    expect(ALL_PAGES).toContain("/privacy");
  });

  it("renders one H1, the review date, every section and a contact address", () => {
    render(<PrivacyPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(`Last reviewed ${LAST_REVIEWED}`)).toBeInTheDocument();
    for (const s of PRIVACY.sections) expect(screen.getByRole("heading", { level: 2, name: s.title })).toBeInTheDocument();
    expect(screen.getByText(/sets no cookies and uses no analytics/)).toBeInTheDocument();
    expect(screen.getByText(/not sent to us, saved on a server or shared/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "tony@tonygreenberg.com" })).toHaveAttribute("href", "mailto:tony@tonygreenberg.com");
  });
});
