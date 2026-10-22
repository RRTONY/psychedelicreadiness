import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PriCalibrationPage, { metadata } from "@/app/pri-calibration/page";
import { DIMS, DIM_LABELS } from "@/lib/content/pri-data";

describe("/pri-calibration", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("PRI Calibration — Psychedelic Readiness Index");
    expect(metadata.description).toMatch(/forced-rank psychometric self-assessment/);
    expect(metadata.alternates?.canonical).toBe("/pri-calibration");
  });

  it("renders one H1 and the intro copy", () => {
    render(<PriCalibrationPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Deep Calibration");
    expect(document.body.textContent).toContain("suffer from acquiescence bias");
    expect(screen.getByText("Takes ~3 minutes. 15 forced choices + 1 full ranking.")).toBeInTheDocument();
  });

  it("links back to the PRI (the homepage here)", () => {
    render(<PriCalibrationPage />);
    expect(screen.getByRole("link", { name: /Back to PRI/ })).toHaveAttribute("href", "/");
  });

  it("walks through all 15 comparisons and the ranking, then shows the profile (nothing is saved)", async () => {
    const user = userEvent.setup();
    render(<PriCalibrationPage />);
    await user.click(screen.getByRole("button", { name: /Begin Calibration/ }));

    for (let i = 1; i <= 15; i++) {
      expect(screen.getByText(`Comparison ${i} of 15`)).toBeInTheDocument();
      const options = screen.getByText(/more ready/).closest("div")!.querySelectorAll("button");
      expect(options).toHaveLength(2);
      await user.click(options[0]);
    }

    expect(screen.getByRole("heading", { name: "Rank All Dimensions" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Continue/ }));

    expect(screen.queryByRole("heading", { name: "Contribute to Research?" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calibrated Profile" })).toBeInTheDocument();
    for (const d of DIMS) expect(screen.getByText(DIM_LABELS[d])).toBeInTheDocument();
  });
});
