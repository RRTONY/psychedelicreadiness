import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteFooter } from "@/components/site-footer";
import { FOOTER_NAV } from "@/lib/site-nav";

describe("SiteFooter", () => {
  it("lists every page under its group heading", () => {
    render(<SiteFooter />);
    for (const group of FOOTER_NAV) {
      const nav = within(screen.getByRole("navigation", { name: group.title }));
      expect(nav.getByRole("heading", { name: group.title })).toBeInTheDocument();
      for (const l of group.links) expect(nav.getByRole("link", { name: l.label })).toHaveAttribute("href", l.href);
    }
  });

  it("says it isn't medical advice and links Tony's site and ImpactSoul", () => {
    const { container } = render(<SiteFooter />);
    expect(screen.getByText("For education only. Not medical advice.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "tonygreenberg.com" })).toHaveAttribute("href", "https://tonygreenberg.com");
    const impact = screen.getByRole("link", { name: "ImpactSoul" });
    expect(impact).toHaveAttribute("href", "https://impactsoul.is");
    expect(impact).toHaveAttribute("rel", "noopener noreferrer");
    expect(container).toHaveTextContent(`© ${new Date().getFullYear()} Tony Greenberg`);
    expect(container.querySelector("footer")).toHaveClass("print:hidden");
  });
});
