import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IbogaCompassSection } from "@/components/pri/iboga-compass-section";
import {
  COMPASS_DIMENSIONS,
  COMPASS_FORMULA,
  COMPASS_QUESTIONS,
  COMPASS_SOURCES,
} from "@/lib/content/pri-iboga-compass-data";

describe("IbogaCompassSection", () => {
  it("has the section headings and the scoring formula", () => {
    render(<IbogaCompassSection />);
    expect(screen.getByRole("heading", { level: 2, name: "Assessment — v2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Full Question Set" })).toBeInTheDocument();
    expect(screen.getByText(COMPASS_FORMULA)).toBeInTheDocument();
  });

  it("lists all ten dimensions", () => {
    render(<IbogaCompassSection />);
    for (const d of COMPASS_DIMENSIONS) expect(screen.getAllByText(d.dimension).length).toBeGreaterThan(0);
  });

  it("puts every question in the HTML inside <details> that open one at a time", () => {
    const { container } = render(<IbogaCompassSection />);
    const details = container.querySelectorAll('details[name="iboga-compass-questions"]');
    expect(details).toHaveLength(COMPASS_QUESTIONS.length);
    const allQuestions = COMPASS_QUESTIONS.flatMap((s) => s.questions);
    expect(allQuestions).toHaveLength(28);
    for (const q of allQuestions) expect(container.textContent).toContain(q.text);
    const first = COMPASS_QUESTIONS[0];
    expect(details[0].querySelector("summary")).toHaveTextContent(
      `01${first.sectionTitle}${first.questions.length} question${first.questions.length > 1 ? "s" : ""}`,
    );
  });

  it("links the sources in a new tab and the interactive compass", () => {
    render(<IbogaCompassSection />);
    for (const s of COMPASS_SOURCES) {
      const link = screen.getAllByRole("link").find((a) => a.getAttribute("href") === s.url);
      expect(link).toHaveAttribute("target", "_blank");
    }
    expect(screen.getAllByRole("link").some((a) => a.getAttribute("href") === "/iboga-compass")).toBe(true);
  });
});
