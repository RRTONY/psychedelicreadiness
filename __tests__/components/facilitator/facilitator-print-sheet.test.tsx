import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FacilitatorPrintSheet } from "@/components/facilitator/facilitator-print-sheet";
import { FACILITATOR_BANDS } from "@/lib/content/facilitator-index-data";

describe("FacilitatorPrintSheet", () => {
  it("is hidden on screen and shown only when printing", () => {
    const { container } = render(<FacilitatorPrintSheet />);
    expect(container.firstElementChild).toHaveClass("hidden", "print:block");
  });

  it("has no H1 (the page already has one) and a title line", () => {
    render(<FacilitatorPrintSheet />);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText("The Facilitator Index")).toBeInTheDocument();
  });

  it("prints every band, tradition and item straight from the page data", () => {
    const { container } = render(<FacilitatorPrintSheet />);
    for (const band of FACILITATOR_BANDS) {
      expect(screen.getByRole("heading", { level: 2, name: band.title })).toBeInTheDocument();
      if (band.note) expect(container).toHaveTextContent(band.note);
      for (const t of band.traditions ?? []) expect(screen.getByText(`T${t.n}.`)).toBeInTheDocument();
      for (const item of band.items) expect(container).toHaveTextContent(item.text);
    }
    const itemCount = FACILITATOR_BANDS.reduce((n, b) => n + b.items.length, 0);
    expect(itemCount).toBe(108);
  });

  it("names this site and today's date in the footer", () => {
    const { container } = render(<FacilitatorPrintSheet />);
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    expect(container.querySelector("footer")).toHaveTextContent(`psychedelicreadiness.com/facilitator-index · Printed: ${today}`);
  });
});
