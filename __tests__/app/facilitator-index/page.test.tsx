import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FacilitatorIndexPage, { metadata } from "@/app/facilitator-index/page";

describe("/facilitator-index", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("The Facilitator Index — Know Who You Go With");
    expect(metadata.description).toMatch(/108 items across twelve bands/);
    expect(metadata.alternates?.canonical).toBe("/facilitator-index");
  });

  it("renders one H1 and the real hero copy", () => {
    const { container } = render(<FacilitatorIndexPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Facilitator Index");
    expect(container).toHaveTextContent("Companion to the Psychedelic Readiness Index · Invitation Only · v1.0 Pilot");
    expect(container).toHaveTextContent("The field has no shared standard.");
  });

  it("links to the Psychedelic Readiness Index and Tony's story", () => {
    render(<FacilitatorIndexPage />);
    expect(screen.getByRole("link", { name: "Psychedelic Readiness Index" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Tony Greenberg" }).getAttribute("href")).toMatch(/\/about$/);
  });

  it("opens with the archetype quiz entry and the full-index option", () => {
    const { container } = render(<FacilitatorIndexPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Know Who You Go With" })).toBeInTheDocument();
    expect(container).toHaveTextContent("15 items. Your Practitioner Archetype at the end. No account, no record.");
    expect(screen.getByRole("button", { name: "Discover My Archetype" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip to Full 108-Item Index" })).toBeInTheDocument();
  });

  it("carries the copyright watermark, hidden from screen readers", () => {
    const { container } = render(<FacilitatorIndexPage />);
    const mark = [...container.querySelectorAll("[aria-hidden='true']")].find((el) => el.textContent?.includes("All Rights Reserved"));
    expect(mark).toBeDefined();
  });

  it("hides the page when printing and prints the question sheet instead", () => {
    const { container } = render(<FacilitatorIndexPage />);
    const [page, sheet] = [...container.children];
    expect(page).toHaveClass("print:hidden");
    expect(sheet.tagName).toBe("ARTICLE");
    expect(sheet).toHaveClass("hidden", "print:block");
    expect(sheet).toHaveTextContent("psychedelicreadiness.com/facilitator-index");
  });
});
