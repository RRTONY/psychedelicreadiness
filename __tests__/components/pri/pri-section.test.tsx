import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriEyebrow, PriSection } from "@/components/pri/pri-section";

describe("PriSection", () => {
  it("is a light section by default", () => {
    const { container } = render(<PriSection id="intro">hello</PriSection>);
    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("id", "intro");
    expect(section).not.toHaveAttribute("data-dark");
    expect(section).toHaveClass("bg-pri-cream");
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("marks a dark section so the eyebrow can switch to the readable purple", () => {
    const { container } = render(
      <PriSection id="dark" dark>
        <PriEyebrow>Eyebrow</PriEyebrow>
      </PriSection>,
    );
    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("data-dark", "true");
    expect(section).toHaveClass("bg-pri-ink");
    expect(screen.getByText("Eyebrow")).toHaveClass("group-data-dark/pri:text-pri-purple-light");
  });
});
