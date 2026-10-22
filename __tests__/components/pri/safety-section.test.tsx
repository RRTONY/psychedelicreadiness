import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafetySection } from "@/components/pri/safety-section";
import { MEDICINES } from "@/lib/content/pri-data";
import { getMedicineWithSafety } from "@/lib/content/pri-shared";

describe("SafetySection", () => {
  it("shows the warning, every list item and the legal status for a medicine", () => {
    const m = getMedicineWithSafety(MEDICINES[0]);
    render(<SafetySection medicine={m} />);
    expect(screen.getByText(m.safetyWarning)).toBeInTheDocument();
    expect(screen.getByText(m.legalStatus)).toBeInTheDocument();
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual([...m.contraindications, ...m.drugInteractions, ...m.sideEffects]);
  });

  it("shows the 'data pending' fallback for a medicine with no safety data", () => {
    const m = getMedicineWithSafety({ ...MEDICINES[0], id: "no-such-medicine" });
    render(<SafetySection medicine={m} />);
    expect(screen.getByText(/Safety data is being compiled/)).toBeInTheDocument();
    expect(screen.getByText("Varies by jurisdiction. Research local laws.")).toBeInTheDocument();
  });
});
