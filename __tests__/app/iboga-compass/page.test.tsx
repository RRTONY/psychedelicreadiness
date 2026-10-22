import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import IbogaCompassPage, { metadata } from "@/app/iboga-compass/page";

describe("/iboga-compass", () => {
  it("has its own title, description and canonical", () => {
    expect(metadata.title).toBe("Iboga Compass Assessment — PRI");
    expect(metadata.description).toMatch(/readiness and fit for iboga or ibogaine therapy/);
    expect(metadata.alternates?.canonical).toBe("/iboga-compass");
  });

  it("opens on section 1 of 7 with the real first questions", () => {
    const { container } = render(<IbogaCompassPage />);
    expect(container).toHaveTextContent("Section 1 of 7");
    expect(container).toHaveTextContent("What is your primary reason for seeking iboga/ibogaine?");
    expect(container).toHaveTextContent("How urgent is your timeline?");
    expect(screen.getByRole("heading", { level: 1, name: "What You're Seeking" })).toBeInTheDocument();
  });

  it("offers the real answer choices as buttons", () => {
    render(<IbogaCompassPage />);
    expect(screen.getByRole("button", { name: /Substance dependency/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Within 30 days/ })).toBeInTheDocument();
  });

  it("has exactly one H1: the current section's title", () => {
    render(<IbogaCompassPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What You're Seeking");
  });
});
