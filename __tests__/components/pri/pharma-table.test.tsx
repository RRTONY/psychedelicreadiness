import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PharmaTable } from "@/components/pri/pharma-table";
import { PHARMA_ALTERNATIVES } from "@/lib/content/pri-mescaline-module";

const bodyRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("PharmaTable", () => {
  it("shows the first 8 rows in a keyboard-scrollable region", () => {
    render(<PharmaTable />);
    expect(screen.getByRole("region", { name: "Table (scrolls sideways)" })).toHaveAttribute("tabindex", "0");
    expect(bodyRows()).toHaveLength(8);
    expect(bodyRows()[0]).toHaveTextContent(PHARMA_ALTERNATIVES[0].drug);
  });

  it("'Show all' reveals every row and then disappears", async () => {
    const user = userEvent.setup();
    render(<PharmaTable />);
    await user.click(screen.getByRole("button", { name: `Show All ${PHARMA_ALTERNATIVES.length} Medications` }));
    expect(bodyRows()).toHaveLength(PHARMA_ALTERNATIVES.length);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("colours the evidence badge by strength", async () => {
    const user = userEvent.setup();
    render(<PharmaTable />);
    await user.click(screen.getByRole("button"));
    const strong = PHARMA_ALTERNATIVES.find((r) => r.evidence.startsWith("Strong"));
    if (strong) expect(screen.getAllByText(strong.evidence)[0]).toHaveClass("text-[#3D6B44]");
    const moderate = PHARMA_ALTERNATIVES.find((r) => r.evidence.startsWith("Moderate"));
    if (moderate) expect(screen.getAllByText(moderate.evidence)[0]).toHaveClass("text-[#7A5C10]");
    expect(strong ?? moderate).toBeTruthy();
  });
});
