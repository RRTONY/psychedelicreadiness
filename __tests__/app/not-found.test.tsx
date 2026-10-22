import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound, { metadata } from "@/app/not-found";

describe("404 page", () => {
  it("has its own tab title, one H1 and a way back to the Index", () => {
    expect(metadata.title).toBe("Page not found | Psychedelic Readiness Index");
    render(<NotFound />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("This page isn’t here");
    expect(screen.getByRole("link", { name: /Go to the Index/ })).toHaveAttribute("href", "/");
  });
});
