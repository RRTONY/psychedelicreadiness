import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MedicineSequencingPage, { metadata } from "@/app/medicine-sequencing/page";
import { MEDICINES } from "@/lib/content/pri-data";

describe("/medicine-sequencing", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("The Medicine Sequencing Ladder — Don't Skip Rungs");
    expect(metadata.description).toMatch(/six rungs, one principle: don't skip the ladder/);
    expect(metadata.alternates?.canonical).toBe("/medicine-sequencing");
  });

  it("renders one H1 and the hero line with the real medicine count", () => {
    render(<MedicineSequencingPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Medicine Sequencing Ladder");
    expect(screen.getByText(new RegExp(`^${MEDICINES.length} medicines\\. Six rungs\\.`))).toBeInTheDocument();
  });

  it("shows the sequencing philosophy copy", () => {
    render(<MedicineSequencingPage />);
    expect(screen.getByText(/You don't skip from kava to ibogaine/)).toBeInTheDocument();
    expect(
      screen.getByText("Half the people who go through this process will realize they're not ready. That is the system working."),
    ).toBeInTheDocument();
  });

  it("puts the ladder's medicine details in the HTML, not only after a click", () => {
    const { container } = render(<MedicineSequencingPage />);
    expect(container.textContent).toContain("Mambe (Sacred Coca Preparation)");
    expect(container.textContent).toContain("Why this rung");
  });

  it("links to the Readiness Index, the philosophy and the Facilitator Index", () => {
    render(<MedicineSequencingPage />);
    expect(screen.getByRole("link", { name: "Take the Readiness Index" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "the philosophy" })).toHaveAttribute("href", "https://tonygreenberg.com/the-philosophy");
    expect(screen.getByRole("link", { name: "Facilitator Index" })).toHaveAttribute("href", "/facilitator-index");
  });
});
