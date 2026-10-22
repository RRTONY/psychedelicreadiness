import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrintQuestionsButton } from "@/components/facilitator/print-questions-button";

describe("PrintQuestionsButton", () => {
  it("shows its label", () => {
    render(<PrintQuestionsButton label="Print All 108 Questions" />);
    expect(screen.getByRole("button", { name: "Print All 108 Questions" })).toBeInTheDocument();
  });

  it("opens the browser's print dialog, with no pop-up window", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const open = vi.spyOn(window, "open");
    const user = userEvent.setup();
    render(<PrintQuestionsButton label="Print" />);
    await user.click(screen.getByRole("button", { name: "Print" }));
    expect(print).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });
});
