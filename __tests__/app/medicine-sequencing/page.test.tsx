import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MedicineSequencingPage, { metadata } from "@/app/medicine-sequencing/page";
import { MEDICINES } from "@/lib/content/pri-data";

describe("/medicine-sequencing", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("Medicine Sequencing Overview — Psychedelic Readiness Index");
    expect(metadata.description).toMatch(/educational comparison of medicines by intensity and context/);
    expect(metadata.alternates?.canonical).toBe("/medicine-sequencing");
  });

  it("renders one H1 and the hero line with the real medicine count", () => {
    render(<MedicineSequencingPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Medicine Intensity & Context");
    expect(screen.getByText(new RegExp(`^${MEDICINES.length} medicine profiles, grouped for comparison\\.`))).toBeInTheDocument();
  });

  it("shows the sequencing philosophy copy", () => {
    render(<MedicineSequencingPage />);
    expect(screen.getByText(/These groupings form one educational framework/)).toBeInTheDocument();
    expect(
      screen.getByText("Some people may decide that none of these options is right for them now. That is a valid outcome."),
    ).toBeInTheDocument();
  });

  it("puts the ladder's medicine details in the HTML, not only after a click", () => {
    const { container } = render(<MedicineSequencingPage />);
    expect(container.textContent).toContain("Mambe (Coca-Leaf Preparation)");
    expect(container.textContent).toContain("About this category");
  });

  it("links to the Readiness Index, the philosophy and the Facilitator Index", () => {
    render(<MedicineSequencingPage />);
    expect(screen.getByRole("link", { name: "Open the Readiness Index" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "the philosophy" })).toHaveAttribute("href", "https://tonygreenberg.com/the-philosophy");
    expect(screen.getByRole("link", { name: "Facilitator Index" })).toHaveAttribute("href", "/facilitator-index");
  });
});
