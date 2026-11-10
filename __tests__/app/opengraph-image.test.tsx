import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { render } from "@testing-library/react";

// next/og draws with WebAssembly, which jsdom can't run; this fake keeps what it was given.
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(
      public element: ReactElement,
      public options: unknown,
    ) {}
  },
}));

const { default: OpengraphImage, alt, size, contentType } = await import("@/app/opengraph-image");

describe("share image", () => {
  it("is a 1200×630 PNG with alt text", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(alt).toMatch(/^Psychedelic Readiness Index/);
  });

  it("shows the domain, the name and the line under it", () => {
    const res = OpengraphImage() as unknown as { element: ReactElement; options: unknown };
    expect(res.options).toEqual(size);
    const { container } = render(res.element);
    expect(container).toHaveTextContent("PSYCHEDELICREADINESS.COM");
    expect(container).toHaveTextContent("Psychedelic Readiness Index");
    expect(container).toHaveTextContent("39 substances. 6 domains. Know where you stand before you go in.");
    expect(container).toHaveTextContent("Talk to your psychedelic council.");
    expect(container).toHaveTextContent("No medical clearance.");
    expect(container).toHaveTextContent("psychedelicreadiness.com/disclaimer");
    expect(container.querySelector("svg path:last-child")?.getAttribute("d")).toMatch(/^M0 0h7/);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
