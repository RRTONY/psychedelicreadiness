import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { FacebookIcon, LinkedinIcon, XIcon } from "@/components/icons/brand-icons";

describe("brand icons", () => {
  it.each([
    ["XIcon", XIcon],
    ["LinkedinIcon", LinkedinIcon],
    ["FacebookIcon", FacebookIcon],
  ])("%s is a decorative svg that takes a className and inherits colour", (_n, Icon) => {
    const { container } = render(<Icon className="size-4" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveClass("size-4");
    expect(svg.querySelector("path")?.getAttribute("d")).toBeTruthy();
  });
});
