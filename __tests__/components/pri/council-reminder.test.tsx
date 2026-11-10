import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CouncilReminder } from "@/components/pri/council-reminder";
import { COUNCIL_REMINDER } from "@/lib/content/pri-disclaimer";

describe("CouncilReminder", () => {
  it.each(["dark", "light"] as const)("%s: shows the reminder and links to the full disclaimer", (tone) => {
    render(<CouncilReminder tone={tone} className="extra" />);
    const box = screen.getByRole("complementary", { name: "Reminder" });
    expect(box).toHaveClass("extra");
    expect(screen.getByText(COUNCIL_REMINDER.title)).toBeInTheDocument();
    expect(screen.getByText(COUNCIL_REMINDER.body)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: COUNCIL_REMINDER.link })).toHaveAttribute("href", "/disclaimer");
  });

  it("defaults to the dark tone", () => {
    render(<CouncilReminder />);
    expect(screen.getByRole("complementary")).toHaveClass("bg-pri-purple/12");
  });

  it("print: writes the address out instead of a link", () => {
    render(<CouncilReminder tone="print" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(`${COUNCIL_REMINDER.link}: psychedelicreadiness.com/disclaimer`)).toBeInTheDocument();
  });
});
