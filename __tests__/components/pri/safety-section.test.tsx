import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafetySection } from "@/components/pri/safety-section";
import { MEDICINES } from "@/lib/content/pri-data";
import { getMedicineWithSafety, UNREVIEWED_SAFETY_LIST, UNREVIEWED_SAFETY_WARNING } from "@/lib/content/pri-shared";

describe("SafetySection", () => {
  it("shows the warning, every list item and the legal status for a medicine", () => {
    const m = getMedicineWithSafety(MEDICINES[0]);
    render(<SafetySection medicine={m} />);
    expect(screen.getByText(m.safetyWarning)).toBeInTheDocument();
    expect(screen.getByText(m.legalStatus)).toBeInTheDocument();
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual([...m.contraindications, ...m.drugInteractions, ...m.sideEffects]);
  });

  it("says plainly that an unreviewed medicine's data isn't reviewed: no placeholder rows, no '...'", () => {
    const m = getMedicineWithSafety({ ...MEDICINES[0], id: "no-such-medicine", safetyWarning: undefined });
    render(<SafetySection medicine={m} />);
    expect(m.safetyReviewed).toBe(false);
    expect(screen.getByText(UNREVIEWED_SAFETY_WARNING)).toBeInTheDocument();
    expect(screen.getAllByText(UNREVIEWED_SAFETY_LIST)).toHaveLength(3);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(document.body.textContent).not.toMatch(/Data pending|being compiled/);
    expect(screen.getByText("Varies by jurisdiction. Research local laws.")).toBeInTheDocument();
  });
});
