import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import IbogaIbogainePage, { metadata } from "@/app/iboga-ibogaine/page";

// A big page: give each render room on a busy machine.
vi.setConfig({ testTimeout: 45_000 });

describe("/iboga-ibogaine", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("Iboga vs Ibogaine — Deep Dive | Psychedelic Readiness Index");
    expect(metadata.description).toMatch(/The Plant vs The Isolate/);
    expect(metadata.alternates?.canonical).toBe("/iboga-ibogaine");
  });

  it("renders one H1 and the real hero copy", () => {
    const { container } = render(<IbogaIbogainePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Iboga vs Ibogaine");
    expect(container).toHaveTextContent("Twelve companion alkaloids in sacred synergy");
    expect(container).toHaveTextContent("Cardiac screening mandatory");
  });

  it("keeps the safety sections and hard stops on the page", () => {
    const { container } = render(<IbogaIbogainePage />);
    for (const h of ["The Entourage Effect", "What the Data Shows", "Who Should Not Do This", "Who's Doing It Right"]) {
      expect(screen.getByRole("heading", { level: 2, name: h })).toBeInTheDocument();
    }
    expect(container).toHaveTextContent("These are absolute contraindications. Not risk factors to manage. Hard stops.");
    expect(container).toHaveTextContent("Long QT Syndrome or QTc above 450ms on any EKG.");
  });

  it("opens outside links in a new tab safely", () => {
    const { container } = render(<IbogaIbogainePage />);
    expect(screen.getByRole("link", { name: /Back to PRI/ })).toHaveAttribute("href", "/");
    const mission = screen.getByRole("link", { name: "missionwithin.org" });
    expect(mission).toHaveAttribute("href", "https://missionwithin.org");
    for (const a of container.querySelectorAll('a[target="_blank"]')) expect(a.getAttribute("rel")).toContain("noopener");
  });

  it("has no pharma-to-plant alternatives table (removed 2026-11-11, same as Peyote)", () => {
    const { container } = render(<IbogaIbogainePage />);
    expect(container.querySelector("#pharma-alternatives")).toBeNull();
    expect(screen.queryByText("What Iboga Replaces")).not.toBeInTheDocument();
    expect(screen.queryByText(/Plant Alternatives/)).not.toBeInTheDocument();
  });
});
