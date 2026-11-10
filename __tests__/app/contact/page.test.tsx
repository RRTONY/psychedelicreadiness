import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage, { metadata } from "@/app/contact/page";
import { CRISIS_RESOURCES } from "@/lib/content/pri-data";
import { ALL_PAGES } from "@/lib/site-nav";

describe("/contact", () => {
  it("has its own title, description, canonical and og:url, and is in the footer", () => {
    expect(metadata.title).toBe("Contact — Psychedelic Readiness Index");
    expect(metadata.alternates?.canonical).toBe("/contact");
    expect(metadata.openGraph).toMatchObject({ url: "/contact" });
    expect(ALL_PAGES).toContain("/contact");
  });

  it("gives Tony's email, the correction route, every crisis line and the council reminder", () => {
    render(<ContactPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "tony@tonygreenberg.com" })).toHaveAttribute("href", "mailto:tony@tonygreenberg.com");
    expect(screen.getByText(/Suggest Correction/)).toBeInTheDocument();
    for (const r of CRISIS_RESOURCES) {
      expect(screen.getByText(r.name)).toBeInTheDocument();
      expect(screen.getByText(r.contact)).toBeInTheDocument();
    }
    expect(screen.getByText("Talk to your psychedelic council.")).toBeInTheDocument();
  });
});
