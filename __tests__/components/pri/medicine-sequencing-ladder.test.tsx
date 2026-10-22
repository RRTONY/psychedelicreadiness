import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { COMPLEXITY_ORDER, MedicineSequencingLadder, levelOf } from "@/components/pri/medicine-sequencing-ladder";
import { MEDICINES } from "@/lib/content/pri-data";

const count = (level: string) => MEDICINES.filter((m) => levelOf(m) === level).length;
const usedLevels = COMPLEXITY_ORDER.filter((l) => count(l) > 0);

describe("levelOf", () => {
  it("treats a missing or unknown level as Intermediate", () => {
    expect(levelOf({ ...MEDICINES[0], complexityLevel: undefined })).toBe("Intermediate");
    expect(levelOf({ ...MEDICINES[0], complexityLevel: "Weird" })).toBe("Intermediate");
    expect(levelOf({ ...MEDICINES[0], complexityLevel: "Hard Stop" })).toBe("Hard Stop");
  });
});

describe("MedicineSequencingLadder", () => {
  it("groups every medicine into its rung, in ladder order, with filter counts", () => {
    render(<MedicineSequencingLadder />);
    expect(screen.getByRole("button", { name: `All (${MEDICINES.length})` })).toHaveAttribute("aria-pressed", "true");
    const rungs = screen.getAllByRole("region");
    expect(rungs.map((r) => r.getAttribute("aria-label"))).toEqual(usedLevels.map((l) => `${l} rung`));
    for (const level of usedLevels) {
      expect(screen.getByRole("button", { name: `${level} (${count(level)})` })).toBeInTheDocument();
      expect(within(screen.getByRole("region", { name: `${level} rung` })).getAllByRole("button")).toHaveLength(count(level));
    }
  });

  it("sorts by intensity within a rung", () => {
    render(<MedicineSequencingLadder />);
    const level = usedLevels.find((l) => count(l) > 1)!;
    const expected = MEDICINES.filter((m) => levelOf(m) === level)
      .sort((a, b) => a.intensity - b.intensity)
      .map((m) => m.name);
    const names = within(screen.getByRole("region", { name: `${level} rung` }))
      .getAllByRole("button")
      .map((b) => b.querySelector(".font-heading")?.textContent);
    expect(names).toEqual(expected);
  });

  it("a level filter hides (but keeps in the HTML) the other rungs, and toggles off", async () => {
    const user = userEvent.setup();
    render(<MedicineSequencingLadder />);
    const [first, second] = usedLevels;
    await user.click(screen.getByRole("button", { name: `${first} (${count(first)})` }));
    expect(screen.getByRole("region", { name: `${first} rung` })).not.toHaveClass("hidden");
    expect(screen.getByRole("region", { name: `${second} rung` })).toHaveClass("hidden");
    await user.click(screen.getByRole("button", { name: `${first} (${count(first)})` }));
    expect(screen.getByRole("region", { name: `${second} rung` })).not.toHaveClass("hidden");
  });

  it("keeps each card's details in the HTML before it is opened, and opens on click", async () => {
    const user = userEvent.setup();
    render(<MedicineSequencingLadder />);
    const m = MEDICINES[0];
    expect(screen.getByText(m.overview)).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: new RegExp(m.name.replace(/[()]/g, "\\$&")) });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("img", { name: `Intensity ${Math.round(m.intensity * 100)} of 100` }).length).toBeGreaterThan(0);
  });
});
