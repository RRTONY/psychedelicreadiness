import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacilitatorIndexContent } from "@/components/facilitator/facilitator-index-content";
import { FACILITATOR_BANDS } from "@/lib/content/facilitator-index-data";

vi.mock("@/app/forms/actions", () => ({ submitFacilitatorIndex: vi.fn() }));

describe("FacilitatorIndexContent", () => {
  it("starts with the quick intake and keeps the full instrument folded", () => {
    render(<FacilitatorIndexContent />);
    expect(screen.getByRole("heading", { name: "Know Who You Go With" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /read the full instrument/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /print \/ save as pdf/i })).toBeInTheDocument();
    expect(screen.queryByText(FACILITATOR_BANDS[0].title)).not.toBeInTheDocument();
  });

  it("opening the full instrument shows every band, the submission form and the related links", async () => {
    const user = userEvent.setup();
    render(<FacilitatorIndexContent />);
    await user.click(screen.getByRole("button", { name: /read the full instrument/i }));
    for (const band of FACILITATOR_BANDS) expect(screen.getAllByText(band.title).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /submit to the index/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /print all 108 questions/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /read the full instrument/i })).not.toBeInTheDocument();
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/");
    for (const img of screen.getAllByRole("img")) {
      expect(img.getAttribute("alt")).toBeTruthy();
      expect(img.getAttribute("src")).not.toMatch(/manuscdn|manus-storage|\/api\/img\//);
    }
  });

  it("the intake's skip button also opens the full instrument", async () => {
    const user = userEvent.setup();
    render(<FacilitatorIndexContent />);
    await user.click(screen.getByRole("button", { name: /skip to full 108-item index/i }));
    expect(screen.getByRole("button", { name: /submit to the index/i })).toBeInTheDocument();
  });
});
