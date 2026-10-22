import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { LogoMark } from "@/components/logo-mark";

describe("LogoMark", () => {
  it("is decorative and takes extra classes", () => {
    const { container } = render(<LogoMark className="size-12" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-12", "shrink-0");
  });

  it("draws the same gauge as the tab icon (src/app/icon.svg)", () => {
    const { container } = render(<LogoMark />);
    const icon = readFileSync("src/app/icon.svg", "utf8");
    for (const p of container.querySelectorAll("path")) expect(icon).toContain(`d="${p.getAttribute("d")}"`);
    const dot = container.querySelector("circle")!;
    expect(icon).toContain(`cx="${dot.getAttribute("cx")}" cy="${dot.getAttribute("cy")}" r="${dot.getAttribute("r")}"`);
  });
});
