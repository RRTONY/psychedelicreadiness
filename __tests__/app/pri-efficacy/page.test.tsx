import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PriEfficacyPage, { metadata } from "@/app/pri-efficacy/page";

describe("/pri-efficacy", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("PRI Efficacy — Research and Evidence");
    expect(metadata.description).toMatch(/Monte Carlo simulation research/);
    expect(metadata.alternates?.canonical).toBe("/pri-efficacy");
  });

  it("renders one H1 and the simulation findings", () => {
    render(<PriEfficacyPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("PRI Efficacy Report");
    expect(screen.getAllByText(/Monte Carlo simulation with 10,000 synthetic respondents/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Forced-rank calibration nearly doubles classification accuracy/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Methodology" })).toBeInTheDocument();
  });

  it("has no Live Calibrations tab (this site keeps no database)", () => {
    render(<PriEfficacyPage />);
    expect(screen.queryByText("Live Calibrations")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("links to the assessment and the calibration", () => {
    render(<PriEfficacyPage />);
    expect(screen.getByRole("link", { name: /Take the PRI Assessment/ })).toHaveAttribute("href", "/");
    for (const a of screen.getAllByRole("link", { name: /Deep Calibration/ })) {
      expect(a).toHaveAttribute("href", "/pri-calibration");
    }
  });
});
