import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteHeader } from "@/components/site-header";
import { PRIMARY_NAV } from "@/lib/site-nav";

describe("SiteHeader", () => {
  it("links the logo home", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Psychedelic Readiness, home" })).toHaveAttribute("href", "/");
  });

  it("lists every main page and the Evidence button in the desktop nav", () => {
    render(<SiteHeader />);
    const nav = within(screen.getByRole("navigation", { name: "Main" }));
    for (const item of PRIMARY_NAV) expect(nav.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    expect(nav.getByRole("link", { name: /The Evidence/ })).toHaveAttribute("href", "/pri-efficacy");
  });

  it("has the phone menu button and stays out of print", () => {
    const { container } = render(<SiteHeader />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(container.querySelector("header")).toHaveClass("print:hidden");
  });
});
