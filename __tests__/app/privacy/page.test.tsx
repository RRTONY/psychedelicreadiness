import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage, { metadata } from "@/app/privacy/page";
import { LAST_REVIEWED, PRIVACY, buildPrivacy } from "@/lib/content/site-pages";
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

  it("describes Google Analytics only when it is switched on", () => {
    const off = JSON.stringify(buildPrivacy(false));
    expect(off).toContain("uses no analytics");
    expect(off).not.toContain("Google Analytics");
    const on = buildPrivacy(true);
    const text = JSON.stringify(on);
    expect(text).toContain("The site uses Google Analytics to count visits");
    expect(text).toContain("never sent to Google Analytics");
    expect(text).not.toContain("uses no analytics");
    expect(on.sections.find((s) => s.title === "Services that see your visit")?.items).toContain(
      "Google Analytics (Google) receives the visit information described under “Cookies, analytics and tracking”.",
    );
    expect(on.sections.map((s) => s.title)).toEqual(buildPrivacy(false).sections.map((s) => s.title));
  });
});
