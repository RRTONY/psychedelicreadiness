import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PriReport } from "@/components/pri/pri-report";
import { DIM_LABELS, MEDICINES, QUESTIONS, type DimKey } from "@/lib/content/pri-data";
import { computeScores } from "@/lib/content/pri-shared";

const results = computeScores(QUESTIONS.map((_, i) => (i % 3 === 0 ? 9 : i % 3 === 1 ? 6 : 3)));
const table = (title: string) => screen.getByRole("heading", { level: 2, name: title }).nextElementSibling as HTMLElement;

describe("PriReport", () => {
  it("is hidden on screen, printed only, and has no H1", () => {
    const { container } = render(<PriReport results={results} savedMeds={[]} date="May 1, 2026" />);
    expect(container.firstElementChild).toHaveClass("hidden", "print:block");
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText("Personal Report · May 1, 2026")).toBeInTheDocument();
  });

  it("shows the overall score and level", () => {
    render(<PriReport results={results} savedMeds={[]} date="d" />);
    expect(screen.getByText(String(results.overall))).toBeInTheDocument();
    expect(screen.getByText(results.level.label)).toBeInTheDocument();
    expect(screen.getByText(results.level.description)).toBeInTheDocument();
  });

  it("lists every dimension with its score and a bar sized to it", () => {
    render(<PriReport results={results} savedMeds={[]} date="d" />);
    const t = within(table("Dimension Breakdown"));
    for (const d of Object.keys(results.dimScores) as DimKey[]) {
      const row = t.getByText(DIM_LABELS[d]).closest("tr")!;
      expect(row).toHaveTextContent(`${results.dimScores[d]}/100`);
      expect(row.querySelector<HTMLElement>("[style]")!.style.width).toBe(`${results.dimScores[d]}%`);
    }
  });

  it("colours bars by band: green when high, mid purple in the middle, deep purple when low", () => {
    const fake = {
      ...results,
      dimScores: { ...results.dimScores, medical: 80, pharmacological: 60, psychological: 20 },
      topMatches: [
        { ...results.topMatches[0], matchScore: 85 },
        { ...results.topMatches[1], matchScore: 65 },
        { ...results.topMatches[2], matchScore: 30 },
      ],
    };
    render(<PriReport results={fake} savedMeds={[]} date="d" />);
    const bar = (label: string, t: string) => within(table(t)).getByText(label).closest("tr")!.querySelector("[style]")!;
    expect(bar(DIM_LABELS.medical, "Dimension Breakdown")).toHaveClass("bg-[#2E7D32]");
    expect(bar(DIM_LABELS.pharmacological, "Dimension Breakdown")).toHaveClass("bg-pri-purple-mid");
    expect(bar(DIM_LABELS.psychological, "Dimension Breakdown")).toHaveClass("bg-pri-purple");
    expect(bar(fake.topMatches[0].name, "Top Medicine Matches")).toHaveClass("bg-[#2E7D32]");
    expect(bar(fake.topMatches[1].name, "Top Medicine Matches")).toHaveClass("bg-pri-purple-mid");
    expect(bar(fake.topMatches[2].name, "Top Medicine Matches")).toHaveClass("bg-pri-purple");
  });

  it("ranks the top matches and lists the healing sequence with timing and cost", () => {
    render(<PriReport results={results} savedMeds={[]} date="d" />);
    const matches = within(table("Top Medicine Matches"));
    results.topMatches.forEach((m, i) => {
      const row = matches.getByText(m.name).closest("tr")!;
      expect(row).toHaveTextContent(`#${i + 1}`);
      expect(row).toHaveTextContent(`${m.matchScore}%`);
    });
    const seq = within(table("Recommended Healing Sequence"));
    expect(seq.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Step & Rationale", "Timing", "Est. Cost"]);
    for (const s of results.sequence) {
      const row = seq.getByText(s.name).closest("tr")!;
      expect(row).toHaveTextContent(s.time);
      expect(row).toHaveTextContent(s.cost);
    }
  });

  it("shows the saved shortlist only when there is one", () => {
    const { rerender } = render(<PriReport results={results} savedMeds={[]} date="d" />);
    expect(screen.queryByRole("heading", { name: "My Saved Medicines" })).not.toBeInTheDocument();
    rerender(<PriReport results={results} savedMeds={[MEDICINES[0], MEDICINES[1]]} date="d" />);
    expect(screen.getByRole("heading", { name: "My Saved Medicines" })).toBeInTheDocument();
    expect(screen.getAllByText(MEDICINES[0].name).length).toBeGreaterThan(0);
    expect(screen.getAllByText(MEDICINES[1].src).length).toBeGreaterThan(0);
  });

  it("ends with the disclaimer and this site's name, and renders text as text", () => {
    const evil = { ...results, level: { ...results.level, label: "<img src=x onerror=alert(1)>" } };
    const { container } = render(<PriReport results={evil} savedMeds={[]} date="d" />);
    expect(container).toHaveTextContent("This is not medical advice.");
    expect(container.querySelector("footer")).toHaveTextContent("Generated at psychedelicreadiness.com · d");
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });
});
